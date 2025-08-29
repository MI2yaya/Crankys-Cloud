import GitHub from "@auth/core/providers/github";
import Discord from "@auth/core/providers/discord";
import { defineConfig } from "auth-astro";
import { getAdapter } from "./src/db/connection";

export default defineConfig(async (ctx) => ({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
        }),
        Discord({
            clientId: import.meta.env.DISCORD_CLIENT_ID,
            clientSecret: import.meta.env.DISCORD_CLIENT_SECRET,
        })
    ],
    adapter: await getAdapter(ctx),
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },
}));
