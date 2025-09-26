CREATE TABLE `users_to_tracks_downvotes` (
	`user_id` integer NOT NULL,
	`track_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `track_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users_to_tracks_upvotes` (
	`user_id` integer NOT NULL,
	`track_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `track_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`description` text,
	`userId` text NOT NULL,
	`image` text,
	`link` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tracks`("id", "title", "author", "description", "userId", "image", "link") SELECT "id", "title", "author", "description", "userId", "image", "link" FROM `tracks`;--> statement-breakpoint
DROP TABLE `tracks`;--> statement-breakpoint
ALTER TABLE `__new_tracks` RENAME TO `tracks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;