"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const companies = [
  {
    name: "Ashby",
    url: "https://ashbyhq.com",
    bg: "#5b52d9",
    text: "#fff",
    roles: [
      {
        period: "2026 — PRESENT",
        title: "Manager, Dedicated Customer Success (EMEA)",
        company: "Ashby",
        description:
          "Leading the dedicated CS function in EMEA for the all-in-one recruiting platform. Building and scaling customer success strategies for enterprise clients.",
      },
      {
        period: "2025 — 2026",
        title: "Senior Strategic Customer Success Manager",
        company: "Ashby",
        description:
          "Managed strategic accounts, driving adoption and expansion of Ashby's recruiting suite across high-growth companies.",
      },
      {
        period: "2024 — 2025",
        title: "Customer Success Manager",
        company: "Ashby",
        description:
          "Owned a portfolio of mid-market and enterprise accounts, driving onboarding, adoption, and retention across Ashby's recruiting platform.",
      },
    ],
  },
  {
    name: "Bird / Taxi for Email",
    url: "https://bird.com",
    bg: "#5b52d9",
    text: "#fff",
    roles: [
      {
        period: "2021 — 2024",
        title: "Lead Customer Success Manager — Taxi for Email",
        company: "Bird (MessageBird)",
        description:
          "Led CS, support, and education for Taxi for Email through SparkPost's acquisition by MessageBird/Bird. Grew the team and built out the customer success function from the ground up.",
        note: "Acquired by MessageBird",
      },
      {
        period: "2018 — 2021",
        title: "Customer Success, Support & Education Team Manager",
        company: "Taxi for Email",
        description:
          "Managed the full customer lifecycle for the email design and production platform. Built onboarding programmes, ran enablement sessions, and established the support operation.",
      },
    ],
  },
  {
    name: "GatherContent",
    url: "https://gathercontent.com",
    bg: "#111111",
    text: "#fff",
    roles: [
      {
        period: "2017 — 2018",
        title: "Product Marketing Manager",
        company: "GatherContent",
        description:
          "Led product marketing efforts, shaping go-to-market strategy, positioning, and messaging for the content operations platform.",
      },
      {
        period: "2015 — 2017",
        title: "Customer Success Manager",
        company: "GatherContent",
        description:
          "Managed customer relationships end-to-end, driving onboarding, adoption, and renewals for the content workflow platform.",
      },
    ],
  },
  {
    name: "PAYMILL",
    url: "https://paymill.com",
    bg: "#4545e8",
    text: "#fff",
    roles: [
      {
        period: "2014 — 2015",
        title: "Account Manager",
        company: "PAYMILL",
        description:
          "Managed key accounts for the European payment platform, supporting merchants with onboarding, integration, and growth.",
      },
    ],
  },
];

const sideQuests = [
  {
    emoji: "🎙️",
    title: "Post Sales Party",
    description:
      "Launching a community and content series for post-sales professionals. Conversations, events, and resources for CS, support, and enablement leaders.",
  },
  {
    emoji: "🎯",
    title: "CS Mentoring @ Tangent",
    description:
      "Mentoring the next generation of customer success professionals through structured programmes and 1:1 coaching.",
  },
  {
    emoji: "🏃",
    title: "Running & Triathlon",
    description:
      "Training for marathons and triathlons. Tracking every mile on Strava and writing about the journey.",
  },
  {
    emoji: "🛠️",
    title: "Building This Website",
    description:
      "Designed and built this personal site with Lovable — experimenting with AI-assisted development, Spotify integrations, and Strava APIs.",
  },
  {
    emoji: "🎵",
    title: "Music Discovery",
    description:
      "Curating playlists and exploring new sounds. Always looking for the next track that stops you mid-scroll.",
  },
];

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<"work" | "sidequests">("work");
  const [activeCompany, setActiveCompany] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection observer to update active company as user scrolls
  useEffect(() => {
    if (activeTab !== "work") return;

    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCompany(i);
        },
        { threshold: 0.4 }
      );
      obs.observe(ref);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [activeTab]);

  const scrollToCompany = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 60px)" }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 flex items-start pt-4 px-6 pb-2"
        style={{ backgroundColor: companies[activeCompany].bg, transition: "background-color 0.4s" }}
      >
        {/* Avatar */}
        <div className="shrink-0 mr-6 mt-1">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300">
            <Image
              src="/images/avatar.jpg"
              alt="Ben Hubbard"
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("work")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "work"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>💼</span> Work
          </button>
          <button
            onClick={() => setActiveTab("sidequests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "sidequests"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>🚀</span> Side Quests
          </button>
        </div>
      </div>

      {activeTab === "work" ? (
        <div className="flex flex-1">
          {/* Company sidebar */}
          <aside
            className="hidden md:flex flex-col gap-3 w-44 shrink-0 sticky top-[72px] self-start px-6 py-6"
            style={{ color: companies[activeCompany].text, transition: "color 0.4s" }}
          >
            {companies.map((c, i) => (
              <button
                key={c.name}
                onClick={() => scrollToCompany(i)}
                className={`text-left text-sm transition-opacity ${
                  activeCompany === i ? "opacity-100" : "opacity-40"
                }`}
                style={{ color: "inherit" }}
              >
                {activeCompany === i ? "● " : "○ "}
                {c.name}
              </button>
            ))}
          </aside>

          {/* Timeline */}
          <div className="flex-1">
            {companies.map((company, i) => (
              <div
                key={company.name}
                ref={(el) => { sectionRefs.current[i] = el; }}
                className="min-h-screen px-6 md:px-12 py-16"
                style={{ backgroundColor: company.bg, color: company.text }}
              >
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity flex items-center gap-2"
                    style={{ color: "inherit" }}
                  >
                    {company.name}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                      <path d="M4 12L12 4M12 4H6M12 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </h2>

                <div className="relative ml-2">
                  {/* Vertical line */}
                  <div className="absolute left-0 top-2 bottom-2 w-px bg-white/20" />

                  <div className="flex flex-col gap-10">
                    {company.roles.map((role) => (
                      <div key={role.title} className="pl-8 relative">
                        {/* Dot */}
                        <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-white/60" />

                        <p className="text-xs font-medium tracking-widest uppercase opacity-60 mb-1">
                          {role.period}
                        </p>
                        <h3 className="text-xl font-semibold mb-1">{role.title}</h3>
                        <p className="text-sm opacity-60 mb-2">
                          {role.company}
                          {role.note && (
                            <span className="ml-2 inline-flex items-center">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline mr-1">
                                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                                <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                              </svg>
                              {role.note}
                            </span>
                          )}
                        </p>
                        <p className="text-sm opacity-80 leading-relaxed max-w-xl">
                          {role.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full">
          <div className="flex flex-col gap-4">
            {sideQuests.map((quest) => (
              <div
                key={quest.title}
                className="border border-gray-200 rounded-xl p-6 flex gap-4 items-start"
              >
                <span className="text-2xl shrink-0">{quest.emoji}</span>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{quest.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{quest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
