import type { APIRoute } from "astro";
import { getDatabase } from "../../db/connection";
import { eq } from "drizzle-orm";
import { tracks } from "../../db/schema";
import type { Session } from "@auth/core/types";
import { getSession } from "auth-astro/server";

export const DELETE: APIRoute = async (ctx): Promise<Response> => {
    const db = await getDatabase(ctx);
    const trackID = ctx.request.headers.get("trackID")! as string;
    const session = await getSession(ctx);

    const track = await db.query.tracks
        .findFirst({
            where: eq(tracks.id, trackID),
            with: {
                mapper: true,
            },
        })
        .execute();

    if (!track) {
        return new Response("No Track Found", {
            status: 404,
        });
    }

    if (track?.mapper.id != session?.user?.id) {
        return new Response("Not Allowed", {
            status: 400,
        });
    }

    const res = await db.delete(tracks).where(eq(tracks.id, trackID)).execute();

    return new Response(res, {
        status: 200,
    });
};
