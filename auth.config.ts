import GitHub from "@auth/core/providers/github";
import { defineConfig } from "auth-astro";
import { D1Adapter } from "@auth/d1-adapter";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Adapter } from "@auth/core/adapters";
import * as schema from "./src/db/schema";
import memoize from 'memoize';

async function getDevDatabaseUnmemoized(): Promise<Adapter> {
    const db = drizzle(":memory:", { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });

    return DrizzleAdapter(db);
}
// We want to persist the dev database at least for the entire runtime
const getDevDatabase = memoize(getDevDatabaseUnmemoized);

async function getAdapter(): Promise<Adapter> {
    if (process.env.NODE_ENV === "dev") {
        return await getDevDatabase()
    }

    return D1Adapter(process.env.DB);
}

export default defineConfig(async ctx => ({
    providers: [
        GitHub({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    adapter: await getAdapter(),
}));
