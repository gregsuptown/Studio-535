CREATE TABLE `designs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`designTheme` text,
	`mockupUrl` varchar(500),
	`iconsFonts` text,
	`designNotes` text,
	`revisionNumber` int NOT NULL DEFAULT 1,
	`status` enum('draft','submitted','approved','revision_requested') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fulfillments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`thankYouMessage` text,
	`careInstructions` text,
	`packagingNotes` text,
	`shippingMethod` varchar(100),
	`trackingNumber` varchar(255),
	`shippedDate` timestamp,
	`deliveredDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fulfillments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intakeForms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`rawMessage` text NOT NULL,
	`projectType` varchar(100),
	`material` varchar(100),
	`dimensions` varchar(255),
	`quantity` int,
	`deadline` timestamp,
	`budget` varchar(100),
	`specialRequirements` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intakeForms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(500) NOT NULL,
	`category` varchar(100),
	`featured` int NOT NULL DEFAULT 0,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productionSetups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`checklist` text,
	`engraverSettings` text,
	`packagingSetup` text,
	`materialsPrepared` int NOT NULL DEFAULT 0,
	`estimatedCompletionDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productionSetups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(50),
	`projectTitle` varchar(255) NOT NULL,
	`status` enum('intake','design','approval','production','fulfillment','completed','cancelled') NOT NULL DEFAULT 'intake',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`breakdown` text,
	`clarifyingQuestions` text,
	`estimatedDuration` varchar(100),
	`validUntil` timestamp,
	`status` enum('draft','sent','approved','rejected') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statusUpdates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`updateType` enum('status','approval','inquiry','upsell') NOT NULL,
	`message` text NOT NULL,
	`nextSteps` text,
	`sentBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `statusUpdates_id` PRIMARY KEY(`id`)
);
