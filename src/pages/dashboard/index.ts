import JSZip from "jszip";
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
      const zipName = data.name;

      // TODO: handle errors when manifest and level aren't found
      const zip = await JSZip.loadAsync(await data.bytes());
      const manifest = zip.file(zipName?.replace(".zip", "") + "/manifest.json");
      if (!manifest) {
        console.log("no manifest.json found for " + zipName);
      }

      // TODO: handle case-sensitivites in file uploads
      const level= zip.file(zipName?.replace(".zip", "") + "/level.json");
      if (!level) {
        console.log("no level.json found for " + zipName);

        if (!manifest) {
          return;
        }
      }

      const meta = await (manifest? manifest?.async("string") : level?.async("string"));

      if (!meta) {
        console.log("No Metadata found!");
        return;
      }

      await fetch("/api/upload", {
        headers: {
          "Content-Type": "application/json",
          zipName,
          meta,
        },
        method: "POST",
        body: await data.bytes(),
      }).then(console.log);
    });
  }
}
customElements.define("upload-section", UploadSection);
