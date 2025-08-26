import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Props as CardProps } from "../components/Card.astro";
import { getDatabase } from "../db/connection";
import { and, eq } from "drizzle-orm";
import { tracks } from "../db/schema";

export const server = {
    getCards: defineAction({
        input: z.object({
            // Since pages are exposed to the URL, we make pages start at 1.
            page: z.number().min(1),
            mapper: z.string().optional(),
        }),
        handler: async ({ page, mapper }, ctx) => {
            // TODO: tracksPerPage customization?
            const tracksPerPage = 20;

            const db = await getDatabase(ctx);

            let where = [];
            // This is here for the dashboard right now, could be used for filtering by mapper in the future
            if (mapper) {
                where.push(eq(tracks.mapper, mapper!))
            }

            // TODO: sorting?
            const paginatedTracks = await db.query.tracks.findMany({
                where: and(...where),
                with: {
                    mapper: true,
                    // TODO: i just want to count these lists
                    downvotes: true,
                    upvotes: true,
                },
                // Standard pagination trick: if there is more than `tracksPerPage` tracks,
                // we know there is another page.
                limit: tracksPerPage + 1,
                offset: (page - 1) * tracksPerPage,
            });

            const finalTracks: CardProps[] = paginatedTracks
                .slice(0, tracksPerPage)
                .map((track) => ({
                    score: track.upvotes.length - track.downvotes.length,
                    title: track.title,
                    mapper: track.mapper.name ?? "(Unnamed)",
                    id: track.id,
                    author: track.author ?? "(Unknown)",
                    image: track.image ?? "/textures/default.png",
                    // TODO: we want to notNull this
                    link: track.link!,

                    mapperId: track.mapper.id
                }));

            return {
                tracks: finalTracks,
                nextPage: tracksPerPage < paginatedTracks.length,
            };
        },
    }),
};
