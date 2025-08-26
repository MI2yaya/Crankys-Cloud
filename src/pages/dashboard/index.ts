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

      // TODO: handle errors when manifest and level aren't found
      const zip = await JSZip.loadAsync(await data.bytes());
      const manifest = zip.file(zipName?.replace(".zip", "") + "/manifest.json");
      if (!manifest) {
        console.log("no manifest.json found for " + zipName);
        return;
      }

      // TODO: handle case-sensitivites in file uploads
      const level= zip.file(zipName?.replace(".zip", "") + "/level.json");
      if (!level) {
        console.log("no level.json found for " + zipName);
        return;
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
