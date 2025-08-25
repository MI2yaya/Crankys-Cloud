import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Props as CardProps } from "../components/Card.astro";
import { getDatabase } from "../db/connection";
import { tracks, usersRelations } from "../db/schema";

export const server = {
    getCards: defineAction({
        input: z.object({
            // Since pages are exposed to the URL, we make pages start at 1.
            page: z.number().min(1),
        }),
        handler: async ({ page }, ctx) => {
            // TODO: tracksPerPage customization?
            const tracksPerPage = 20;

            const db = await getDatabase(ctx);

            // TODO: sorting?
            const paginatedTracks = await db.query.tracks.findMany({
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
                }));

            return {
                tracks: finalTracks,
                nextPage: tracksPerPage < paginatedTracks.length,
            };
        },
    }),
};
