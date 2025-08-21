// @ts-check
import { defineConfig } from "astro/config";
import Icons from "unplugin-icons/vite";
import auth from "auth-astro";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [
            Icons({
                compiler: "astro",
            }),
        ],
    },
    output: "server",

    integrations: [auth()],
    adapter: cloudflare({
        platformProxy: {
            enabled: true,
        },
    }),
});
