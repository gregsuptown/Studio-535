CREATE TABLE `catalog_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`product_count` int NOT NULL DEFAULT 0,
	`design_level` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`service_type` varchar(255),
	`image_url` varchar(500),
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `catalog_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`subcategory_id` int,
	`jds_sku` varchar(50) NOT NULL,
	`jds_class_code` varchar(50),
	`name` varchar(500) NOT NULL,
	`description` text,
	`description_long` text,
	`wholesale_price` int,
	`retail_price` int,
	`dimensions` varchar(255),
	`weight` varchar(100),
	`material` varchar(255),
	`color` varchar(100),
	`image_url` varchar(500),
	`thumbnail_url` varchar(500),
	`additional_images` text,
	`keywords` text,
	`search_text` text,
	`in_stock` int NOT NULL DEFAULT 1,
	`min_order_qty` int NOT NULL DEFAULT 1,
	`design_level` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`customization_options` text,
	`is_featured` int NOT NULL DEFAULT 0,
	`is_active` int NOT NULL DEFAULT 1,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_products_jds_sku_unique` UNIQUE(`jds_sku`)
);
--> statement-breakpoint
CREATE TABLE `catalog_subcategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`jds_class_code` varchar(50),
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`product_count` int NOT NULL DEFAULT 0,
	`image_url` varchar(500),
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalog_subcategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_pricing_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`min_quantity` int NOT NULL,
	`max_quantity` int,
	`price_per_unit` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_pricing_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` varchar(50) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwords` (
	`user_id` int NOT NULL,
	`hashed_password` varchar(255) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passwords_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `project_messages` RENAME COLUMN `sender_open_id` TO `sender_id`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `project_messages` MODIFY COLUMN `sender_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `catalog_products` ADD CONSTRAINT `catalog_products_category_id_catalog_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalog_products` ADD CONSTRAINT `catalog_products_subcategory_id_catalog_subcategories_id_fk` FOREIGN KEY (`subcategory_id`) REFERENCES `catalog_subcategories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `catalog_subcategories` ADD CONSTRAINT `catalog_subcategories_category_id_catalog_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_pricing_tiers` ADD CONSTRAINT `product_pricing_tiers_product_id_catalog_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `catalog_products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;