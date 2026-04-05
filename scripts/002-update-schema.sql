-- Migration: Add missing columns for full character customization + display_name

-- Add display_name to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(50);

-- Add missing character columns
ALTER TABLE characters ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'other';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS shirt_style VARCHAR(20) DEFAULT 'tshirt';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS pants_style VARCHAR(20) DEFAULT 'jeans';

-- Rename skin_color to skin_tone for consistency (if exists)
-- Note: If skin_color already exists, we add skin_tone as alias
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skin_tone VARCHAR(20);
UPDATE characters SET skin_tone = skin_color WHERE skin_tone IS NULL;

-- Add direction and walking state to room_participants for real-time sync
ALTER TABLE room_participants ADD COLUMN IF NOT EXISTS direction VARCHAR(10) DEFAULT 'down';
ALTER TABLE room_participants ADD COLUMN IF NOT EXISTS is_walking BOOLEAN DEFAULT false;

-- Add message_type to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(10) DEFAULT 'text';

-- Create index for faster room lookups
CREATE INDEX IF NOT EXISTS idx_rooms_is_private ON rooms(is_private);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
