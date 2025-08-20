import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import type { Props as CardProps } from "../components/Card.astro";

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
        handler: async ({ page }) => {
            return cards;
        },
    }),
};
