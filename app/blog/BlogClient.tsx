"use client";

import { useState, useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/supabase";
import CategoryPill from "@/components/CategoryPill";

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

// A tint of the brand blue rather than a new hue, so the AI mark reads as
// light without stepping outside the palette.
const LIGHT_BLUE = "#AC93FA";

const TAB_BASE =
  "font-display pointer-events-auto px-5 py-2.5 shadow-lg flex items-center";

const TAB_SHAPE: CSSProperties = {
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

type PanelId = "categories" | "ai" | null;

/**
 * The sheet that unrolls behind a tab. Both tabs share it, so they open and
 * close on identical motion, and the tab row rides down under whichever is up.
 */
function Panel({ id, open, children }: { id: string; open: boolean; children: ReactNode }) {
  return (
    <div
      id={id}
      inert={!open}
      className="disclosure-motion grid w-full pointer-events-auto"
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        transitionDuration: open ? "420ms" : "315ms",
      }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

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
  const [openPanel, setOpenPanel] = useState<PanelId>(null);
  const [active, setActive] = useState<string>(initialCategory ?? ALL);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPanel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenPanel(null); };
    // Dismiss on any press outside the drawer, without swallowing that press.
    const onDown = (e: PointerEvent) => {
      if (!drawerRef.current?.contains(e.target as Node)) setOpenPanel(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openPanel]);

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

  const choose = (category: string) => {
    setActive(category);
    setOpenPanel(null);
  };

  // Opening either tab closes the other, so only one sheet is ever down.
  const toggle = (panel: Exclude<PanelId, null>) =>
    setOpenPanel((current) => (current === panel ? null : panel));

  return (
    <>
      {/* Categories drawer — the tab rides down as the panel unrolls */}
      <div
        ref={drawerRef}
        className="fixed top-0 left-0 right-0 z-40 flex flex-col items-end pointer-events-none"
      >
        <Panel id="blog-categories" open={openPanel === "categories"}>
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
                        onClick={() => choose(category)}
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
        </Panel>

        <Panel id="blog-ai" open={openPanel === "ai"}>
          <div
            className="bg-white px-6 py-8"
            style={{ borderBottom: `2px solid ${BRAND}` }}
          >
            <p className="text-sm text-gray-600">
              Nothing wired up in here yet.
            </p>
          </div>
        </Panel>

        {/* Tabs — stretched so the two stay the same height */}
        <div className="flex items-stretch gap-2 mr-6">
          <button
            onClick={() => toggle("categories")}
            aria-expanded={openPanel === "categories"}
            aria-controls="blog-categories"
            className={`${TAB_BASE} text-white`}
            style={{ ...CATEGORY_TYPE, ...TAB_SHAPE, backgroundColor: BRAND }}
          >
            Categories
          </button>

          <button
            onClick={() => toggle("ai")}
            aria-expanded={openPanel === "ai"}
            aria-controls="blog-ai"
            aria-label="AI"
            className={`${TAB_BASE} bg-white`}
            style={{ ...TAB_SHAPE, border: `2px solid ${BRAND}` }}
          >
            <Sparkle size={18} weight="fill" color={LIGHT_BLUE} />
          </button>
        </div>
      </div>

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
