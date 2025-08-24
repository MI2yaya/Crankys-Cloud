import type { APIRoute } from "astro";
import JSZip from "jszip";
import { createWriteStream } from "node:fs"

export const POST: APIRoute = async ({ params, request }): Promise<Response> => {
  const zip = await JSZip.loadAsync(await request.arrayBuffer());
  const userName = request.headers.get("user");

  // output the zip file. this is temporary LOL
  zip
  .generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(createWriteStream('out.zip'))
  .on('finish', function () {
      // JSZip generates a readable stream with a "end" event,
      // but is piped here in a writable stream which emits a "finish" event.
      console.log("out.zip written.");
  });

  return new Response("", {
    status: 200,
  })
}
