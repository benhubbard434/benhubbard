-- Run this in your Supabase SQL editor to set up the database schema

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  photo_credit TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read of published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can read submissions (not public)
-- (no public policy = no public access)

-- Seed blog posts
INSERT INTO blog_posts (title, slug, date, content, photo_credit, published) VALUES
(
  'The company you work for has been acquired, now what?',
  'the-company-you-work-for-has-been-acquired-now-what',
  '2024-05-29',
  '<p>I''m writing about this from the benefit of hindsight, but I look back on the very chaotic period of my career right after Taxi for Email was acquired twice in one week, first by SparkPost, and then MessageBird acquired SparkPost. I was really fortunate to move under a very supportive, transparent and great manager but I wanted to write down some tips based on how I *fairly* successfully navigated a double acquisition.</p>

<h2>Tip #1: Don''t panic</h2>
<p>It can be very easy to panic, your entire work life shifted direction after an all hands or company wide email. Take a breath, take 30 mins or so away from your emails and clear your head. The next few weeks after this are key to making a good impression, and setting yourself up for success in the new company.</p>',
  'Photo by Igor Omilaev on Unsplash',
  true
),
(
  'An ode to Yorkshire Pudding',
  'an-ode-to-yorkshire-pudding',
  '2023-12-17',
  '<p>Replace this with the full content of your Yorkshire Pudding post.</p>',
  null,
  true
),
(
  'Retooling the site',
  'retooling-the-site',
  '2023-12-10',
  '<p>Replace this with the full content of your Retooling the site post.</p>',
  null,
  true
),
(
  'My values to live by',
  'my-values-to-live-by',
  '2022-10-18',
  '<p>Replace this with the full content of your values post.</p>',
  null,
  true
),
(
  'Case Studies in Customer Success',
  'case-studies-in-customer-success',
  '2021-10-03',
  '<p>Replace this with the full content of your Customer Success case studies post.</p>',
  null,
  true
),
(
  'Building your first email process',
  'building-your-first-email-process',
  '2021-03-07',
  '<p>Replace this with the full content of your email process post.</p>',
  null,
  true
),
(
  'The importance of using Plain English when you write',
  'the-importance-of-using-plain-english-when-you-write',
  '2019-07-25',
  '<p>Replace this with the full content of your Plain English post.</p>',
  null,
  true
),
(
  'Why is empathy important?',
  'why-is-empathy-important',
  '2016-05-19',
  '<p>Replace this with the full content of your empathy post.</p>',
  null,
  true
);
