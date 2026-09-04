"use client";

import { useState, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/supabase";
import CategoryPill from "@/components/CategoryPill";
import TabRail, { TAB_BASE, TAB_SHAPE, type RailItem } from "@/components/TabRail";
import { aiRailItem } from "@/components/AiTab";

const BRAND = "#470FF4";
const ALL = "All";

// Shared by the category items and the tab that opens them, so the two stay
// identical. Half the h3 display step, with caps tracking opened back up from
// the display face's -0.06em.
const CATEGORY_TYPE: CSSProperties = {
  fontSize: "clamp(0.75rem, 0.65rem + 0.5vw, 0.9375rem)",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

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

export default function BlogClient({
  posts,
  initialCategory,
}: {
  posts: BlogPost[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState<string>(initialCategory ?? ALL);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of BLOG_CATEGORIES) map.set(c, 0);
    for (const p of posts) {
      if (p.category && map.has(p.category)) {
        map.set(p.category, (map.get(p.category) ?? 0) + 1);
      }
    }
    return map;
  }, [posts]);

  const visible = useMemo(
    () => (active === ALL ? posts : posts.filter((p) => p.category === active)),
    [posts, active]
  );

  const categoriesItem: RailItem = {
    id: "blog-categories",
    renderPanel: ({ close }) => (
      <div style={{ backgroundColor: BRAND }} className="px-6 py-8">
        {/* Full-bleed rather than the post list's max-w-3xl, so the row
            has the whole screen to stay on one line. */}
        <div className="w-full">
          <ul className="flex flex-col gap-1 sm:flex-row sm:flex-nowrap sm:items-baseline sm:gap-x-7">
            {[ALL, ...BLOG_CATEGORIES].map((category) => {
              const isActive = category === active;
              const count = category === ALL ? posts.length : counts.get(category) ?? 0;
              return (
                <li key={category} className="sm:whitespace-nowrap">
                  <button
                    onClick={() => { setActive(category); close(); }}
                    aria-current={isActive ? "true" : undefined}
                    className="group flex items-baseline gap-2 py-1 text-left transition-opacity hover:opacity-70"
                    style={{ color: "#fff" }}
                  >
                    <span
                      className="font-display"
                      style={{
                        ...CATEGORY_TYPE,
                        textDecoration: isActive ? "underline" : "none",
                        textUnderlineOffset: "5px",
                        textDecorationThickness: "2px",
                      }}
                    >
                      {category}
                    </span>
                    <span className="text-xs text-white/50 tabular-nums">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    ),
    renderTab: ({ open, toggle }) => (
      <button
        onClick={toggle}
        aria-expanded={open}
        aria-controls="blog-categories"
        className={`${TAB_BASE} text-white`}
        style={{ ...CATEGORY_TYPE, ...TAB_SHAPE, backgroundColor: BRAND }}
      >
        Categories
      </button>
    ),
  };

  return (
    <>
      {/* The AI tab joins the rail here so the two descend together */}
      <TabRail items={[categoriesItem, aiRailItem]} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-16 pb-8">
        <h1 className="font-display text-h1 mb-12">Blog</h1>

        {active !== ALL && (
          <div className="flex items-center gap-3 mb-8 -mt-6">
            <span className="text-sm text-gray-500">
              Showing <strong className="font-medium text-black">{active}</strong>
            </span>
            <button
              onClick={() => setActive(ALL)}
              className="text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
              style={{ color: BRAND }}
            >
              Clear
            </button>
          </div>
        )}

        <ul className="divide-y divide-gray-200">
          {visible.length === 0 && (
            <li className="py-6 text-gray-500">
              {posts.length === 0
                ? "No posts yet."
                : `No posts in ${active} yet.`}
            </li>
          )}
          {visible.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block py-6 group hover:opacity-70 transition-opacity"
              >
                <p className="text-xl font-medium text-black group-hover:underline">
                  {post.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <p className="text-sm text-gray-400">{formatDate(post.date)}</p>
                  {post.category && <CategoryPill category={post.category} />}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
