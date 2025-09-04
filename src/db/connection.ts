import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Adapter } from "@auth/core/adapters";
import * as schema from "./schema";
import memoize from "memoize";
import type { APIContext } from "astro";
import { seed } from "drizzle-seed";
import { D1Adapter } from "@auth/d1-adapter";

async function getDevDatabaseUnmemoized(): Promise<LibSQLDatabase<typeof schema>> {
    const db = drizzle(":memory:", { schema });

    await migrate(db, { migrationsFolder: "./drizzle" });

    await seed(db, schema).refine((f) => ({
        tracks: {
            count: 100,
            columns: {
                image: f.valuesFromArray({
                    values: ["/textures/default.png"],
                }),
                author: f.firstName(),
                difficulty: f.valuesFromArray({
                    values: [JSON.stringify([{ value: 6 }])],
                }),
            },
        },
    }));

    return db;
}
// We want to persist the dev database at least for the entire runtime
const getDevDatabase = memoize(getDevDatabaseUnmemoized);

export async function getDatabase(
    ctx: Pick<APIContext, "locals">,
): Promise<LibSQLDatabase<typeof schema> | DrizzleD1Database<typeof schema>> {
    if (process.env.NODE_ENV === "dev") {
        return await getDevDatabase();
    }

    // @ts-ignore where did runtime go?
    const db = ctx.locals.runtime.env.DB;
    return drizzleD1(db, { schema });
}

export async function getAdapter(ctx: APIContext): Promise<Adapter> {
    if (process.env.NODE_ENV === "dev") {
        return DrizzleAdapter(await getDevDatabase(), {
            usersTable: schema.users,
            accountsTable: schema.accounts,
            sessionsTable: schema.sessions,
            verificationTokensTable: schema.verificationTokens,
        });
    }

    // @ts-ignore where did runtime go?
    return D1Adapter(ctx.locals.runtime.env.DB);
}
