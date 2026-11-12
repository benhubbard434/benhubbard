-- Secret santa. Run this once in the Supabase SQL editor.
--
-- Row Level Security is on with no policies, so the public (anon) key can
-- read and write nothing here. Only the server, using the service-role key,
-- can touch these tables.

CREATE TABLE IF NOT EXISTS santa_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  item_1 TEXT NOT NULL,
  item_2 TEXT NOT NULL,
  item_3 TEXT NOT NULL,
  in_side_a BOOLEAN NOT NULL DEFAULT false,
  in_side_b BOOLEAN NOT NULL DEFAULT false,
  partner_id UUID REFERENCES santa_participants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per gift. The primary key means a side can only be drawn once:
-- a second draw for the same people fails as a whole.
CREATE TABLE IF NOT EXISTS santa_draws (
  side TEXT NOT NULL CHECK (side IN ('a', 'b')),
  giver_id UUID NOT NULL REFERENCES santa_participants(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES santa_participants(id) ON DELETE CASCADE,
  PRIMARY KEY (side, giver_id),
  UNIQUE (side, receiver_id)
);

-- Wrong password guesses, keyed by a salted hash of the visitor's IP.
-- Rows are deleted once they are a day old.
CREATE TABLE IF NOT EXISTS santa_attempts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS santa_attempts_lookup ON santa_attempts (ip_hash, attempted_at);

ALTER TABLE santa_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE santa_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE santa_attempts ENABLE ROW LEVEL SECURITY;
