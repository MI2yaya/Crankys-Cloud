ALTER TABLE `accounts` ADD `id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `oauth_token_secret` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `oauth_token` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `id` text NOT NULL;