import GitHub from "@auth/core/providers/github";
import { defineConfig } from "auth-astro";
import { D1Adapter } from "@auth/d1-adapter";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Adapter } from "@auth/core/adapters";
import * as schema from "./src/db/schema";

async function getAdapter(): Promise<Adapter> {
    if (process.env.NODE_ENV === "dev") {
        const db = drizzle(":memory:", { schema });
        await migrate(db, { migrationsFolder: "./drizzle" });

        return DrizzleAdapter(db);
    }

    return D1Adapter(process.env.DB);
}

export default defineConfig({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    adapter: await getAdapter(),
});
