import { BLOG_CATEGORIES, getSupabase, type BlogPost } from "@/lib/supabase";
import BlogClient from "./BlogClient";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

type Props = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const [posts, { category }] = await Promise.all([getPosts(), searchParams]);
  // Pills on a post link back here pre-filtered; anything unrecognised falls
  // through to the unfiltered list.
  const requested = Array.isArray(category) ? category[0] : category;
  const initialCategory = BLOG_CATEGORIES.find((c) => c === requested);

  return <BlogClient posts={posts} initialCategory={initialCategory} />;
}
