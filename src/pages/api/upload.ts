import type { APIRoute } from "astro";
import JSZip from "jszip";
import { getDatabase } from "../../db/connection";
import { tracks, users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx): Promise<Response> => {
  const zip = await JSZip.loadAsync(await ctx.request.arrayBuffer());
  const zipName = ctx.request.headers.get("zipName");
  const userID = ctx.request.headers.get("user");
  console.log("id:" + userID);

  const manifest = zip.file(zipName?.replace(".zip", "") + "/manifest.json");
  if (!manifest) {
    console.log("no manifest found for " + zipName);
    return new Response("Could not find manifest.json", {
      status: 400,
    })
  }

  const meta = JSON.parse(await manifest.async("string")).metadata;
  // console.log(meta);

  const db
   = await getDatabase(ctx);

   let user = await db.
     select()
     .from(users)
     .where(eq(users.name, userID!))
     .execute();

   await db.insert(tracks).values({
    title: meta.songName as string,
    author: meta.artist as string,
    description: meta.description as string,
    mapper: user[0].id,
    image: "",
    link: "",      
   }).returning().execute()


    return new Response("", {
        status: 200,
    });
};
