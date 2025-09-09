import JSZip from "jszip";
import Encoding from "encoding-japanese";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getEnv } from "astro/env/runtime";

console.log(`Hi there!

We don't do any server-side validation of ZIP files (yet),
since we don't have enough compute power to do so.

If you're trying to manually upload a ZIP file for
legitimate reasons, please let us know about your use
case on the Cranky's Customs discord server.
`);

interface Difficulty {
  name?: string;
  value?: string;
}

interface ChartVariant {
  charter: string;
  display: string;
  difficulty: number;
  name: string;
}

class UploadSection extends HTMLElement {
  constructor() {
    super();

    const form: HTMLFormElement = document.querySelector("[data-upload]")!;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      new FormData(form);
    });

    form.addEventListener("formdata", async (e) => {
      const data = e.formData.get("file") as File;

      // TODO: handle errors when manifest and level aren't found
      const zip = await JSZip.loadAsync(await data.bytes());

      // weird workaround to get the name of the inner folder, since the zip's
      // filename can be different to the name of the inner folder
      const zipName = zip
        .filter((x) => {
          return x.endsWith("level.json") && !x.includes("backup");
        })[0]
        .name.replace("/level.json", "");

      if (zipName.includes('/')) {
        console.log("charts in subfolders not allowed")
        return;
      }

      const manifest = zip.file(zipName! + "/manifest.json");
      if (!manifest) {
        console.log("no manifest.json found for " + data.name);
      }

      // TODO: handle case-sensitivites in file uploads
      const level = zip.file(zipName! + "/level.json");
      if (!level) {
        console.log("no level.json found for " + zipName);

        if (!manifest) {
          console.log("LOL!!!! There's not hing to pull metadata from. idion");
          return;
        }
      }

      const file = await (manifest ? manifest?.async("string") : level?.async("string"))!;

      const json = JSON.parse(file!);
      const meta = json.metadata;

      if (!meta) {
        console.log("No Metadata found!");
        return;
      }

      let difficulty: Difficulty[] | undefined = undefined;
      if (manifest) {
        difficulty = json.variants.map((variant: ChartVariant) => {
          return {
            name: variant.display,
            value: variant.difficulty < 0 ? "?" : "" + variant.difficulty,
          };
        });
      } else {
        // TODO: shared difficulty logic between this and Card.astro in a separate file?
        let diffValue = json.metadata.difficulty;
        let diffName;

        if (!diffValue) {
          diffName = "----";
        } else if (diffValue < 0) {
          diffName = "Special";
          diffValue = "?";
        } else if (diffValue <= 6) {
          diffName = "Easy";
        } else if (diffValue <= 10) {
          diffName = "Hard";
        } else if (diffValue <= 14) {
          diffName = "Challenge";
        } else if (diffValue <= 9999) {
          diffName = "Apocrypha";
        } else if (diffValue > 9999) {
          diffName = undefined;
        }

        difficulty = [
          {
            name: diffName,
            value: "" + diffValue,
          },
        ];
      }

      const _meta = JSON.stringify(meta);
      const __meta = Encoding.convert(Encoding.stringToCode(_meta), {
        to: "UTF8",
        from: "AUTO",
        type: "string",
      });
      console.log(__meta);

      const headers = new Headers();
      headers.append('Content-Type', 'application/octet-stream')
      headers.append('meta', __meta);
      headers.append('zipName', zipName);
      headers.append('difficulty', JSON.stringify(difficulty))

      await fetch("/api/upload", {
        headers: headers,
        method: "POST",
        body: await data.bytes(),
      }).then(console.log);
    });
  }
}
customElements.define("upload-section", UploadSection);
