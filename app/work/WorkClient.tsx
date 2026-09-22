"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { sideQuests, sideQuestHref } from "@/lib/side-quests";
import QuestCard from "./QuestCard";
import CompanyWordmark, { type CompanyLogo } from "./CompanyWordmark";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimelineEntry = {
  company: string;
  role: string;
  period: string;
  description: string;
  url?: string;
  tooltip?: string;
};

type CompanyGroup = {
  name: string;
  id: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  logo: CompanyLogo;
  /** Shown in an info tooltip beside the company heading. */
  tooltip?: string;
  entries: TimelineEntry[];
};


// ─── Data ─────────────────────────────────────────────────────────────────────

const companyGroups: CompanyGroup[] = [
  {
    name: "Ashby",
    id: "ashby",
    bgColor: "#473bce",
    textColor: "hsl(252, 20%, 95%)",
    accentColor: "hsl(252, 60%, 80%)",
    logo: { src: "/images/logos/ashby.svg", height: "0.95em" },
    entries: [
      {
        company: "Ashby",
        role: "Manager, Dedicated Customer Success (EMEA)",
        period: "2026 — Present",
        description:
          "Leading the dedicated CS function in EMEA for the all-in-one recruiting platform. Building and scaling customer success strategies for enterprise clients.",
        url: "https://www.ashbyhq.com",
      },
      {
        company: "Ashby",
        role: "Senior Strategic Customer Success Manager",
        period: "2025 — 2026",
        description:
          "Managed strategic accounts, driving adoption and expansion of Ashby's recruiting suite across high-growth companies.",
        url: "https://www.ashbyhq.com",
      },
      {
        company: "Ashby",
        role: "Customer Success Manager",
        period: "2024 — 2025",
        description:
          "Owned a portfolio of mid-market and enterprise accounts, driving onboarding, adoption, and retention across Ashby's recruiting platform.",
        url: "https://www.ashbyhq.com",
      },
    ],
  },
  {
    name: "Bird / Taxi for Email",
    id: "bird",
    bgColor: "#141414",
    textColor: "hsl(0, 0%, 92%)",
    accentColor: "hsl(0, 0%, 50%)",
    logo: { src: "/images/logos/bird-taxi.png", height: "1.5em" },
    tooltip: "Bird (formerly MessageBird) bought Taxi for Email and SparkPost in 2021.",
    entries: [
      {
        company: "Bird (MessageBird)",
        role: "Lead Customer Success Manager — Taxi for Email",
        period: "2021 — 2024",
        description:
          "Led CS, support, and education for Taxi for Email through SparkPost's acquisition by MessageBird/Bird. Grew the team and built out the customer success function from the ground up.",
        url: "https://www.bird.com",
        tooltip: "Bird acquired Taxi for Email in 2021.",
      },
      {
        company: "Taxi for Email",
        role: "Customer Success, Support & Education Team Manager",
        period: "2018 — 2021",
        description:
          "Managed the full customer lifecycle for the email design and production platform. Built onboarding programmes, ran enablement sessions, and established the support operation.",
        url: "https://www.taxiforemail.com",
      },
    ],
  },
  {
    name: "GatherContent",
    id: "gathercontent",
    bgColor: "#126dfe",
    textColor: "hsl(210, 20%, 97%)",
    accentColor: "hsl(210, 80%, 80%)",
    logo: { src: "/images/logos/gathercontent.svg", height: "0.9em" },
    entries: [
      {
        company: "GatherContent",
        role: "Product Marketing Manager",
        period: "2017 — 2018",
        description:
          "Led product marketing efforts, shaping go-to-market strategy, positioning, and messaging for the content operations platform.",
        url: "https://www.gathercontent.com",
      },
      {
        company: "GatherContent",
        role: "Customer Success Manager",
        period: "2015 — 2017",
        description:
          "Managed customer relationships end-to-end, driving onboarding, adoption, and renewals for the content workflow platform.",
        url: "https://www.gathercontent.com",
      },
    ],
  },
  {
    name: "PAYMILL",
    id: "paymill",
    bgColor: "#f05000",
    textColor: "hsl(0, 0%, 97%)",
    accentColor: "hsl(20, 80%, 80%)",
    logo: { src: "/images/logos/paymill.png", height: "1.6em" },
    entries: [
      {
        company: "PAYMILL",
        role: "Account Manager",
        period: "2014 — 2015",
        description:
          "Managed key accounts for the European payment platform, supporting merchants with onboarding, integration, and growth.",
        url: "https://www.paymill.com",
      },
    ],
  },
];


// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function IconBriefcase() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─── Simple tooltip ───────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex opacity-50 transition-opacity hover:opacity-80"
        aria-label={text}
      >
        <IconInfo />
      </button>
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-md bg-black/90 px-3 py-2 text-xs text-white shadow-lg z-50 pointer-events-none"
          role="tooltip"
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </span>
      )}
    </span>
  );
}

// ─── Side quest colours ───────────────────────────────────────────────────────

/**
 * Each card's solid fill on hover, taken from the brightest of the brand and
 * /music colours. Only ones that carry dark ink, so the title stays legible
 * and the white bubbles show against every one of them.
 */
const QUEST_GROUNDS = [
  "#04F06A", // Spring Green — brand
  "#FFD400", // Acid yellow
  "#00D9E0", // Cyan
  "#FF4FD8", // Magenta
  "#C8FF00", // Lime
  "#FF6B00", // Orange
  "#FF3366", // Coral
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export type TabKey = "work" | "side-quests";

/** Each tab has its own URL, so the back button returns to the tab you left. */
const TAB_HREF: Record<TabKey, string> = {
  work: "/work",
  "side-quests": "/work?tab=side-quests",
};

export default function WorkClient() {
  // Read the tab from the URL on the client, so switching tabs is a
  // history.pushState rather than a round trip to the server.
  const searchParams = useSearchParams();
  const activeTab: TabKey = searchParams.get("tab") === "side-quests" ? "side-quests" : "work";

  const switchTab = (e: React.MouseEvent<HTMLAnchorElement>, tab: TabKey) => {
    // Let cmd/ctrl/middle-click open the tab in a new window as normal.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (tab !== activeTab) window.history.pushState(null, "", TAB_HREF[tab]);
  };

  const [bgColor, setBgColor] = useState(companyGroups[0].bgColor);
  const [textColor, setTextColor] = useState(companyGroups[0].textColor);
  const [activeCompanyId, setActiveCompanyId] = useState(companyGroups[0].id);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver — sync sidebar + colours as user snaps between sections
  useEffect(() => {
    if (activeTab !== "work") return;
    const root = scrollContainerRef.current;
    if (!root) return;

    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio >= 0.5) {
            setBgColor(companyGroups[i].bgColor);
            setTextColor(companyGroups[i].textColor);
            setActiveCompanyId(companyGroups[i].id);
          }
        },
        { threshold: 0.5, root }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [activeTab]);

  // Paint the document too, so overscroll shows the company colour rather
  // than white. See body:has([data-full-bleed]) in globals.css.
  const ground = activeTab === "work" ? bgColor : "#fff";
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", ground);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, [ground]);

  const handleNavClick = (id: string) => {
    const idx = companyGroups.findIndex((g) => g.id === id);
    sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      data-full-bleed
      className="min-h-screen"
      style={{
        backgroundColor: ground,
        color: activeTab === "work" ? textColor : "#111",
        transition: "background-color 700ms ease-in-out, color 700ms ease-in-out",
      }}
    >
      {/* Avatar — fixed top-left, rotated; springs when hovered */}
      <div className="fixed z-50 head-spring" style={{ top: 20, left: 20 }}>
        <Image
          src="/images/avatar.png"
          alt="Ben Hubbard"
          width={75}
          height={75}
          style={{ transform: "rotate(-10deg)", objectFit: "cover", borderRadius: 0 }}
          priority
        />
      </div>

      {/* Tabs — fixed top-centre */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-6 pt-6">
        <div className="flex gap-1 rounded-md border border-white/20 bg-black/30 p-1 backdrop-blur-md">
          <a
            href={TAB_HREF["work"]}
            onClick={(e) => switchTab(e, "work")}
            aria-current={activeTab === "work" ? "page" : undefined}
            className={`flex items-center justify-center gap-2 rounded-sm px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "work"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <IconBriefcase /> Work
          </a>
          <a
            href={TAB_HREF["side-quests"]}
            onClick={(e) => switchTab(e, "side-quests")}
            aria-current={activeTab === "side-quests" ? "page" : undefined}
            className={`flex items-center justify-center gap-2 rounded-sm px-6 py-2 text-sm font-medium transition-colors ${
              activeTab === "side-quests"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <IconRocket /> Side Quests
          </a>
        </div>
      </div>

      {/* ── Work tab ─────────────────────────────────────────────────────────── */}
      {activeTab === "work" && (
        <>
          {/* Sidebar — fixed left, vertically centred */}
          <aside className="fixed left-0 top-0 z-30 flex h-screen w-36 flex-col justify-center pl-4 md:w-48 md:pl-6">
            <nav className="flex flex-col gap-3">
              {companyGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleNavClick(group.id)}
                  className={`text-left text-sm transition-all duration-300 ${
                    activeCompanyId === group.id
                      ? "font-semibold opacity-100"
                      : "font-normal opacity-50 hover:opacity-75"
                  }`}
                  style={{ color: "inherit" }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full transition-all duration-300 shrink-0"
                      style={{
                        backgroundColor:
                          activeCompanyId === group.id ? "currentColor" : "transparent",
                        border:
                          activeCompanyId === group.id ? "none" : "1px solid currentColor",
                      }}
                    />
                    {group.name}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Snap-scroll container */}
          <div
            ref={scrollContainerRef}
            className="h-screen w-full overflow-y-auto pl-36 md:pl-48"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {companyGroups.map((group, gi) => (
              <section
                key={group.id}
                id={group.id}
                ref={(el) => { sectionRefs.current[gi] = el; }}
                className="flex min-h-screen items-center justify-center px-6 py-20"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="mx-auto w-full max-w-2xl">
                  {/* Company heading */}
                  <CompanyWordmark name={group.name} logo={group.logo}>
                    {group.tooltip && <InfoTooltip text={group.tooltip} />}
                    {group.entries[0]?.url && (
                      <a
                        href={group.entries[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-50 transition-opacity hover:opacity-80"
                        style={{ color: "inherit" }}
                      >
                        <IconExternalLink />
                      </a>
                    )}
                  </CompanyWordmark>

                  {/* Timeline entries */}
                  <div className="relative pl-8">
                    {group.entries.map((entry, ei) => (
                      <div key={ei} className="relative mb-8 last:mb-0">
                        {/* Dot */}
                        <div
                          className="absolute z-10 h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: group.accentColor,
                            left: "calc(-2rem - 4px)",
                            top: "0.375rem",
                          }}
                        />
                        {/* Connector line (not on last entry) */}
                        {ei < group.entries.length - 1 && (
                          <div
                            className="absolute w-[2px]"
                            style={{
                              left: "calc(-2rem)",
                              top: "0.75rem",
                              backgroundColor: group.accentColor,
                              height: "calc(100% + 2rem)",
                              opacity: 0.4,
                            }}
                          />
                        )}

                        <span className="text-xs font-medium uppercase tracking-widest opacity-60">
                          {entry.period}
                        </span>
                        <h3 className="mt-1 text-2xl">{entry.role}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-sm opacity-60">{entry.company}</span>
                          {entry.tooltip && <InfoTooltip text={entry.tooltip} />}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed opacity-70">
                          {entry.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {/* ── Side Quests tab ───────────────────────────────────────────────────── */}
      {activeTab === "side-quests" && (
        <div className="mx-auto max-w-3xl px-6 pt-24 pb-28">
          <div className="grid gap-4">
            {sideQuests.map((quest, qi) => (
              <QuestCard
                key={quest.slug}
                href={sideQuestHref(quest)}
                ground={QUEST_GROUNDS[qi % QUEST_GROUNDS.length]}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{quest.emoji}</span>
                  {/* Descriptions are kept in lib/side-quests.ts but hidden for now */}
                  <h3 className="text-2xl text-gray-900">{quest.title}</h3>
                </div>
              </QuestCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
