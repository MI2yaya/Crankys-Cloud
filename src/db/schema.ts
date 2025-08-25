// All of the initial user tables (account, session, verificationToken, authenticator)
// were provided by Auth.js: https://authjs.dev/getting-started/adapters/drizzle

import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from "@auth/core/adapters";
import { customAlphabet } from "nanoid";

// ID length doesn't matter much, but its contents do: we want a simple, copy-pastable
// id.
const nanoid = customAlphabet("1234567890abcdef", 22);

export const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => nanoid()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    image: text("image"),
});

export const accounts = sqliteTable(
    "accounts",
    {
        id: text("id").notNull().$defaultFn(() => nanoid()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
        oauth_token_secret: text("oauth_token_secret"),
        oauth_token: text("oauth_token"),
    },
    (account) => [
        primaryKey({
            name: "compoundKey",
            columns: [account.provider, account.providerAccountId],
        }),
    ],
);

export const sessions = sqliteTable("sessions", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    id: text("id").notNull().$defaultFn(() => nanoid()),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
    "verification_tokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            name: "compositePk",
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ],
);

export const authenticators = sqliteTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: integer("credentialBackedUp", {
            mode: "boolean",
        }).notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        primaryKey({
            name: "compositePK",
            columns: [authenticator.userId, authenticator.credentialID],
        }),
    ],
);

export const tracks = sqliteTable("tracks", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => nanoid()),
    author: text("author"),
    description: text("description"),
    mapper: text("userId")
        .notNull()
        // TODO: do we delete songs if a user deletes themselves?
        .references(() => users.id, { onDelete: "cascade" }),
    image: text("image"),
    // (download) link
    link: text("link"),
});

export const usersRelations = relations(users, ({ many }) => ({
	upvotes: many(tracks),
    downvotes: many(tracks),
}));
