import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AiLevel } from "./ai-provenance";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  content: string;
  photo_credit: string | null;
  published: boolean;
  // Optional until every row is tagged; posts without one show only under "All".
  category?: string | null;
  // AI provenance. Null on any of these means "inherit the sitewide claim",
  // not "no AI involvement" — see lib/ai-provenance.ts.
  ai_code_level?: AiLevel | null;
  ai_code_note?: string | null;
  ai_words_level?: AiLevel | null;
  ai_words_note?: string | null;
  ai_media_level?: AiLevel | null;
  ai_media_note?: string | null;
  ai_other_level?: AiLevel | null;
  ai_other_note?: string | null;
};

export const BLOG_CATEGORIES = [
  "Customer Success",
  "Work",
  "Making",
  "Life",
] as const;

export type ContactSubmission = {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
};
