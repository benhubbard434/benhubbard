import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase, type BlogPost } from "@/lib/supabase";
import CategoryPill, { categoryHref } from "@/components/CategoryPill";
import ScrollProgress from "@/components/ScrollProgress";
import PostTabRail from "@/components/PostTabRail";
import { provenanceFor, provenanceFromRow } from "@/lib/ai-provenance";

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

const WORDS_PER_MINUTE = 200;

/**
 * Word count and reading estimate for a post's stored HTML. Tags collapse to
 * spaces so adjacent blocks don't merge into one word, and a token only counts
 * if it holds a letter or digit — that drops stray dashes and bare entities.
 */
function readingStats(html: string) {
  const text = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, "");

  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

  return { words, minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
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

  const { words, minutes } = readingStats(post.content);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-12 pb-16">
      <ScrollProgress />
      <PostTabRail
        provenance={provenanceFor(`/blog/${slug}`, provenanceFromRow(post))}
      />

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
        <p className="text-sm text-gray-400">
          {words.toLocaleString("en-GB")} words &middot; {minutes} min read
        </p>
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
