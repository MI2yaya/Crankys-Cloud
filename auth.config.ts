import GitHub from "@auth/core/providers/github";
import { defineConfig } from "auth-astro";
import { getAdapter } from "./src/db/connection";

export default defineConfig(async ctx => ({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    adapter: await getAdapter(ctx),
}));
