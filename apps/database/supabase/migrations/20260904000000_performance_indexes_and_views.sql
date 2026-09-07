-- ==============================================================================
-- Performance Indexes & Active Ideas View Migration
-- Migration: 20260904000000_performance_indexes_and_views.sql
-- ==============================================================================

-- 1. Composite Index: User Ideas Dashboard
-- Speeds up queries filtering by owner, soft-delete status, and ordered by created_at DESC
CREATE INDEX IF NOT EXISTS idx_ideas_owner_deleted_created 
ON ideas(owner_id, deleted_at, created_at DESC);

-- 2. Partial Index: Public Discovery Directory
-- Only indexes active public ideas, eliminating table scans when filtering by difficulty/created_at
CREATE INDEX IF NOT EXISTS idx_ideas_public_discovery 
ON ideas(visibility, difficulty, created_at DESC) 
WHERE deleted_at IS NULL AND visibility = 'PUBLIC';

-- 3. Composite Index: Saved Ideas / Bookmarks
-- Guarantees sub-millisecond lookups for user saved items
CREATE INDEX IF NOT EXISTS idx_saved_ideas_user_idea 
ON saved_ideas(user_id, idea_id);

-- 4. Index: AI Message History Retrieval
-- Speeds up loading conversation history for multi-turn AI chats
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created 
ON ai_messages(conversation_id, created_at ASC);

-- 5. Index: AI Conversations by User
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created 
ON ai_conversations(user_id, created_at DESC);

-- 6. Index: Audit Events by User and Type
CREATE INDEX IF NOT EXISTS idx_audit_events_user_type_created 
ON audit_events(user_id, event_type, created_at DESC);

-- 7. View: Active Ideas View
-- Provides a clean abstraction that automatically filters soft-deleted ideas
CREATE OR REPLACE VIEW active_ideas AS 
SELECT * 
FROM ideas 
WHERE deleted_at IS NULL;

-- 8. Grant permissions on view for authenticated and anon roles
GRANT SELECT ON active_ideas TO authenticated;
GRANT SELECT ON active_ideas TO anon;

COMMENT ON VIEW active_ideas IS 'Active ideas excluding soft-deleted records.';
