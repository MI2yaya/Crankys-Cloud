ALTER TABLE `tracks` ADD `version` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks` ADD `uploader` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks` ADD `uploadedByBot` text DEFAULT 'false';