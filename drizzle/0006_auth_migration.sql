-- Studio 535 - Authentication Migration
-- Migrates from Manus OAuth to Lucia Auth
-- Run this SQL against your TiDB database

-- 1. Add new columns to users table (if they don't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS emailVerified INT DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS avatarUrl VARCHAR(500);

-- 2. Modify users table to use email as the primary identifier
-- First, update email column to be NOT NULL and UNIQUE
-- Note: Make sure all existing users have emails before running this
ALTER TABLE users MODIFY COLUMN email VARCHAR(320) NOT NULL;
ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS idx_users_email (email);

-- 3. Drop the openId column (no longer needed)
-- Note: If you want to preserve existing user data, migrate it first
-- ALTER TABLE users DROP COLUMN openId;
-- For safety, we'll just make it nullable instead of dropping
ALTER TABLE users MODIFY COLUMN openId VARCHAR(64) NULL;

-- 4. Create sessions table for Lucia Auth
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user_id (user_id)
);

-- 5. Create OAuth accounts table for Google/GitHub login
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_oauth_provider_account (provider, provider_account_id),
  INDEX idx_oauth_user_id (user_id)
);

-- 6. Create passwords table for email/password auth
CREATE TABLE IF NOT EXISTS passwords (
  user_id INT PRIMARY KEY,
  hashed_password VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Update project_messages table to use senderId instead of senderOpenId
-- First check if the column exists
ALTER TABLE project_messages 
ADD COLUMN IF NOT EXISTS sender_id INT NOT NULL DEFAULT 0;

-- 8. Migration complete message
SELECT 'Migration complete! Authentication schema updated for Lucia Auth.' as status;
