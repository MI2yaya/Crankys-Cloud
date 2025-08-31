import type { APIRoute } from "astro";
import JSZip from "jszip";
import { getDatabase } from "../../db/connection";
import { tracks, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "auth-astro/server";

export const POST: APIRoute = async (ctx): Promise<Response> => {
  const session = await getSession(ctx);
  const _difficulty = ctx.request.headers.get("difficulty");
  const difficulty = _difficulty? JSON.parse(_difficulty) : undefined;
  const _meta = ctx.request.headers.get("meta")!;
  console.log(_meta);
  const meta = JSON.parse(_meta);

  console.log(difficulty);

  if (!session?.user?.id) {
    return new Response("No User ID" , {
      status: 400
    })
  }

  const db = await getDatabase(ctx);
  await db
    .insert(tracks)
    .values({
      title: meta.songName as string,
      author: meta.artist as string,
      description: meta.description as string,
      mapper: session?.user?.id,
      difficulty: difficulty? JSON.stringify(difficulty) : undefined, 
      image: "",
      link: "",
    })
    .returning()
    .execute();

  return new Response("", {
    status: 200,
  });
};
