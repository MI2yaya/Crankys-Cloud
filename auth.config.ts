import GitHub from "@auth/core/providers/github";
import { defineConfig } from "auth-astro";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "./src/db/schema.ts";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/db/schema.ts";

export default defineConfig({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    // TODO: do we want to just hardcode binding name since wrangler.jsonc is specifying it anyways?
    adapter: DrizzleAdapter(drizzle(process.env.BINDING_NAME!, { schema }), {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
});
