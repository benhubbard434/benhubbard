import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase, type BlogPost } from "@/lib/supabase";
import CategoryPill, { categoryHref } from "@/components/CategoryPill";

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

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-12 pb-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-10"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to blog
      </Link>

      <h1 className="font-display text-h1 mb-4">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <p className="text-sm text-gray-400">{formatDate(post.date)}</p>
        {post.category && (
          <CategoryPill category={post.category} href={categoryHref(post.category)} />
        )}
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.photo_credit && (
        <p className="text-sm text-gray-400 italic mt-4">{post.photo_credit}</p>
      )}
    </main>
  );
}
