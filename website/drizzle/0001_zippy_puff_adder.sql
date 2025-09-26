ALTER TABLE `account` RENAME TO `accounts`;--> statement-breakpoint
ALTER TABLE `session` RENAME TO `sessions`;--> statement-breakpoint
ALTER TABLE `user` RENAME TO `users`;--> statement-breakpoint
ALTER TABLE `verificationToken` RENAME TO `verification_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") SELECT "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state" FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("sessionToken", "userId", "expires") SELECT "sessionToken", "userId", "expires" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
DROP INDEX `user_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_authenticator` (
	`credentialID` text NOT NULL,
	`userId` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`credentialPublicKey` text NOT NULL,
	`counter` integer NOT NULL,
	`credentialDeviceType` text NOT NULL,
	`credentialBackedUp` integer NOT NULL,
	`transports` text,
	PRIMARY KEY(`userId`, `credentialID`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_authenticator`("credentialID", "userId", "providerAccountId", "credentialPublicKey", "counter", "credentialDeviceType", "credentialBackedUp", "transports") SELECT "credentialID", "userId", "providerAccountId", "credentialPublicKey", "counter", "credentialDeviceType", "credentialBackedUp", "transports" FROM `authenticator`;--> statement-breakpoint
DROP TABLE `authenticator`;--> statement-breakpoint
ALTER TABLE `__new_authenticator` RENAME TO `authenticator`;--> statement-breakpoint
CREATE UNIQUE INDEX `authenticator_credentialID_unique` ON `authenticator` (`credentialID`);--> statement-breakpoint
CREATE TABLE `__new_track` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text,
	`description` text,
	`userId` text NOT NULL,
	`image` text,
	`link` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_track`("id", "author", "description", "userId", "image", "link") SELECT "id", "author", "description", "userId", "image", "link" FROM `track`;--> statement-breakpoint
DROP TABLE `track`;--> statement-breakpoint
ALTER TABLE `__new_track` RENAME TO `track`;