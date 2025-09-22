PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`description` text,
	`difficulty` text,
	`mapper` text,
	`discordID` text,
	`image` text,
	`link` text,
	`version` text NOT NULL,
	`uploader` text NOT NULL,
	`uploadedByBot` text DEFAULT 'false',
	FOREIGN KEY (`uploader`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tracks`("id", "title", "author", "description", "difficulty", "mapper", "discordID", "image", "link", "version", "uploader", "uploadedByBot") SELECT "id", "title", "author", "description", "difficulty", "mapper", "discordID", "image", "link", "version", "uploader", "uploadedByBot" FROM `tracks`;--> statement-breakpoint
DROP TABLE `tracks`;--> statement-breakpoint
ALTER TABLE `__new_tracks` RENAME TO `tracks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;