import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Props as CardProps } from "../components/Card.astro";
import { getDatabase } from "../db/connection";
import { tracks } from '../db/schema'

const cards: CardProps[] = Array(40)
    .fill(0)
    .map((_, i) => ({
        id: i.toString(),
        title: "Title" + Math.round(Math.random() * 1000),
        author: "Author",
        mapper: "Mapper",
        image: `/textures/default.png`,
        score: 0,
    }));

export const server = {
    getCards: defineAction({
        input: z.object({
            // Since pages are exposed to the URL, we make pages start at 1.
            page: z.number().min(1),
        }),
        handler: async ({ page }, ctx) => {
            // TODO: user customization?
            const tracksPerPage = 20;
            
            const db = await getDatabase(ctx);

            const paginatedTracks = await db.select()
                .from(tracks)
                // Standard pagination trick: if there is more than `tracksPerPage` tracks,
                // we know there is another page.
                .limit(tracksPerPage + 1)
                .offset((page - 1) * tracksPerPage);

            return {
                tracks: paginatedTracks.slice(0, tracksPerPage),
                nextPage: tracksPerPage < paginatedTracks.length
            }
        },
    }),
};
