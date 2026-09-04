-- AI provenance for blog posts.
--
-- Not yet applied. Run this in the Supabase SQL editor when you are ready;
-- until then the tray falls back to the values in lib/ai-provenance.ts.
--
-- Every column is NULLABLE with no default, and NULL means "inherit the
-- sitewide claim" rather than "no AI involvement". Defaulting a level to
-- 'none' would have every unfilled post override the sitewide "code: mostly"
-- with "code: none" — a false disclosure, published silently, on every post
-- written from the dashboard. Only fill in a column where the post differs.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_level') THEN
    CREATE TYPE ai_level AS ENUM ('none', 'some', 'mostly', 'all');
  END IF;
END $$;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS ai_code_level  ai_level,
  ADD COLUMN IF NOT EXISTS ai_code_note   TEXT,
  ADD COLUMN IF NOT EXISTS ai_words_level ai_level,
  ADD COLUMN IF NOT EXISTS ai_words_note  TEXT,
  ADD COLUMN IF NOT EXISTS ai_media_level ai_level,
  ADD COLUMN IF NOT EXISTS ai_media_note  TEXT,
  ADD COLUMN IF NOT EXISTS ai_other_level ai_level,
  ADD COLUMN IF NOT EXISTS ai_other_note  TEXT;

-- A level without its note, or the other way round, would render half a
-- claim. Require both or neither.
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS ai_provenance_paired;

ALTER TABLE blog_posts
  ADD CONSTRAINT ai_provenance_paired CHECK (
    (ai_code_level  IS NULL) = (ai_code_note  IS NULL) AND
    (ai_words_level IS NULL) = (ai_words_note IS NULL) AND
    (ai_media_level IS NULL) = (ai_media_note IS NULL) AND
    (ai_other_level IS NULL) = (ai_other_note IS NULL)
  );

-- The existing "Public can read published posts" policy is SELECT over the
-- whole row, so these columns are readable through it without change.

-- Moves the one existing exception out of lib/ai-provenance.ts and into the
-- row, so it lives beside the post it describes.
UPDATE blog_posts
   SET ai_media_level = 'all',
       ai_media_note  = 'Header image made with DALL·E. The prompt is in the credit below the post.'
 WHERE slug = 'an-ode-to-yorkshire-pudding';
