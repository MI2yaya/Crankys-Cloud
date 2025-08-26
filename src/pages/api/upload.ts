import type { APIRoute } from "astro";
import JSZip from "jszip";
import { getDatabase } from "../../db/connection";
import { tracks, users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx): Promise<Response> => {
    const zipName = ctx.request.headers.get("zipName");
    const userID = ctx.request.headers.get("user");
    const meta = JSON.parse(ctx.request.headers.get("meta") as string).metadata;

    const db = await getDatabase(ctx);
    await db
        .insert(tracks)
        .values({
            title: meta.songName as string,
            author: meta.artist as string,
            description: meta.description as string,
            mapper: userID!,
            image: "",
            link: "",
        })
        .returning()
        .execute();

    return new Response("", {
        status: 200,
    });
};
