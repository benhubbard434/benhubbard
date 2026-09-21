/**
 * Side quests, shared by the Side Quests tab on /work and the pages under
 * /side-quests. Each one's `slug` is its page at /side-quests/{slug}, unless
 * it sets `href` to point at a page that already exists elsewhere on the site.
 */

export type SideQuest = {
  slug: string;
  title: string;
  emoji: string;
  description?: string;
  /** Links here instead, and no /side-quests page is generated for it. */
  href?: string;
};

export function sideQuestHref(quest: SideQuest): string {
  return quest.href ?? `/side-quests/${quest.slug}`;
}

export const sideQuests: SideQuest[] = [
  {
    slug: "post-sales-party",
    title: "Post Sales Party 🎉",
    emoji: "🎙️",
    description:
      "Launching a community and content series for post-sales professionals. Conversations, events, and resources for CS, support, and enablement leaders.",
  },
  {
    slug: "cs-mentoring",
    title: "CS Mentoring @ Tangent",
    emoji: "🧭",
    description:
      "Mentoring the next generation of customer success professionals through structured programmes and 1:1 coaching.",
  },
  {
    slug: "running-and-triathlon",
    title: "Running & Triathlon",
    emoji: "🏃",
    href: "/running",
    description:
      "Training for marathons and triathlons. Tracking every mile on Strava and writing about the journey.",
  },
  {
    slug: "building-this-website",
    title: "Building This Website",
    emoji: "🛠️",
    description:
      "Designed and built this personal site with Lovable — experimenting with AI-assisted development, Spotify integrations, and Strava APIs.",
  },
  {
    slug: "website-projects",
    title: "Website Projects",
    emoji: "🌐",
  },
  {
    slug: "music-curation",
    title: "Music Curation",
    emoji: "🎵",
    href: "/music",
    description:
      "Curating playlists and exploring new sounds. Always looking for the next track that stops you mid-scroll.",
  },
  {
    slug: "travel",
    title: "Travel",
    emoji: "✈️",
  },
];
