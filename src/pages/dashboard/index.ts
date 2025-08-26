
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
      const user = this.dataset.user as string;

      const zip = await JSZip.loadAsync(await data.bytes());
      const manifest = zip.file(zipName?.replace(".zip", "") + "/manifest.json");
      if (!manifest) {
        console.log("no manifest found for " + zipName);
        return new Response("Could not find manifest.json", {
          status: 400,
        });
      }

      const meta = await manifest.async("string");

      await fetch("/api/upload", {
        headers: {
          "Content-Type": "application/json",
          user: user,
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
