import Link from "next/link";
import { getSupabase, type BlogPost } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  return `${day}${suffix} ${date.toLocaleString("en-GB", { month: "long" })} ${date.getFullYear()}`;
}

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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-16 pb-8">
      <h1 className="font-display text-h1 mb-12">Blog</h1>

      <ul className="divide-y divide-gray-200">
        {posts.length === 0 && (
          <li className="py-6 text-gray-500">No posts yet.</li>
        )}
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="block py-6 group hover:opacity-70 transition-opacity"
            >
              <p className="text-xl font-medium text-black group-hover:underline">
                {post.title}
              </p>
              <p className="text-sm text-gray-400 mt-1">{formatDate(post.date)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
