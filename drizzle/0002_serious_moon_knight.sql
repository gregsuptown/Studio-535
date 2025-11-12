CREATE TABLE `intake_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`intake_id` int NOT NULL,
	`file_url` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_size` int NOT NULL,
	`mime_type` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intake_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `intake_attachments` ADD CONSTRAINT `intake_attachments_intake_id_intakeForms_id_fk` FOREIGN KEY (`intake_id`) REFERENCES `intakeForms`(`id`) ON DELETE cascade ON UPDATE no action;