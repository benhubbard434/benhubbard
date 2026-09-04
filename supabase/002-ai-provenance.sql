-- AI provenance for blog posts.
--
-- Not yet applied. Run this in the Supabase SQL editor when you are ready;
-- until then the tray falls back to the sitewide claims in lib/ai-provenance.ts.
--
-- Each category is a level plus one line of specifics. The level is
-- constrained so a typo cannot reach the page as a blank cell, and defaults to
-- 'none' so an unfilled post never claims something untrue.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_level') THEN
    CREATE TYPE ai_level AS ENUM ('none', 'some', 'mostly', 'all');
  END IF;
END $$;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS ai_code_level  ai_level NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS ai_code_note   TEXT,
  ADD COLUMN IF NOT EXISTS ai_words_level ai_level NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS ai_words_note  TEXT,
  ADD COLUMN IF NOT EXISTS ai_media_level ai_level NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS ai_media_note  TEXT,
  ADD COLUMN IF NOT EXISTS ai_other_level ai_level NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS ai_other_note  TEXT;

-- The existing "Public can read published posts" policy is SELECT over the
-- whole row, so these columns are readable through it without change.

-- Worked example, safe to delete:
-- UPDATE blog_posts
--    SET ai_code_level  = 'mostly', ai_code_note  = 'Built with Claude Code',
--        ai_words_level = 'none',   ai_words_note = 'Written start to finish by me',
--        ai_media_level = 'none',   ai_media_note = 'Photography is my own',
--        ai_other_level = 'some',   ai_other_note = 'Proofreading and alt text'
--  WHERE slug = 'retooling-the-site';
