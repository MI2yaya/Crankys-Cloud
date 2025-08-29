import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Props as CardProps } from "../components/Card.astro";
import { getDatabase } from "../db/connection";
import { and, eq, like, SQL, sql, type SQLWrapper } from "drizzle-orm";
import { tracks } from "../db/schema";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

function lower(email: AnySQLiteColumn): SQL {
    return sql`lower(${email})`;
}

export const server = {
    getCards: defineAction({
        input: z.object({
            // Since pages are exposed to the URL, we make pages start at 1.
            page: z.number().min(1),
            // search parameter: what mapper are we looking for?
            // (currently only used in the dashboard)
            mapper: z.string().optional(),
            // search parameter: (case-insensitive) does the title have this?
            inTitle: z.string().optional()
        }),
        handler: async ({ page, mapper, inTitle }, ctx) => {
            // TODO: tracksPerPage customization?
            const tracksPerPage = 20;

            const db = await getDatabase(ctx);

            let where: SQLWrapper[] = [];
            // This is here for the dashboard right now,
            // though could be used for filtering by mapper in the future
            if (mapper) {
                where.push(eq(tracks.mapper, mapper!))
            }

            if (inTitle !== undefined && inTitle !== '') {
                // TODO i really don't like this % wrapping - is this even safe?
                where.push(like(lower(tracks.title), `%${
                    inTitle.replaceAll("%", "\\%")
                        .replaceAll("_", "\\_")
                }%`))
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