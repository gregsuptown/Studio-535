-- Add new fields to portfolioItems table for enhanced case studies

ALTER TABLE `portfolioItems` ADD COLUMN `material` varchar(100);
ALTER TABLE `portfolioItems` ADD COLUMN `beforeImageUrl` varchar(500);
ALTER TABLE `portfolioItems` ADD COLUMN `afterImageUrl` varchar(500);
ALTER TABLE `portfolioItems` ADD COLUMN `clientName` varchar(255);
ALTER TABLE `portfolioItems` ADD COLUMN `projectDuration` varchar(100);
ALTER TABLE `portfolioItems` ADD COLUMN `challenge` text;
ALTER TABLE `portfolioItems` ADD COLUMN `solution` text;
ALTER TABLE `portfolioItems` ADD COLUMN `outcome` text;
ALTER TABLE `portfolioItems` ADD COLUMN `testimonialText` text;
ALTER TABLE `portfolioItems` ADD COLUMN `testimonialAuthor` varchar(255);
ALTER TABLE `portfolioItems` ADD COLUMN `testimonialRole` varchar(255);
