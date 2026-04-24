import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
};

export type ContactSubmission = {
  id?: string;
  name: string;
  email: string;
  topic: string;
  message: string;
};
