-- Fix sessions table user_id column type for Lucia Auth compatibility
-- Lucia requires string user IDs, but our users table uses int
-- We convert between them in application code

-- First, drop all existing sessions (to avoid data type conversion issues)
TRUNCATE TABLE `sessions`;

-- Modify user_id column from int to varchar
ALTER TABLE `sessions` MODIFY COLUMN `user_id` varchar(21) NOT NULL;
