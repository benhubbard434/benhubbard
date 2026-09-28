import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sideQuests, sideQuestGround } from "@/lib/side-quests";
import ComingSoon from "./ComingSoon";
import Mentoring from "./Mentoring";
import PublicSpeaking from "./PublicSpeaking";
import Travel from "./Travel";

// Only side quests without their own page elsewhere get one here; anything
// else 404s.
const ownPages = sideQuests.filter((q) => !q.href);

export const dynamicParams = false;

export function generateStaticParams() {
  return ownPages.map((quest) => ({ slug: quest.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quest = ownPages.find((q) => q.slug === slug);
  return quest ? { title: `${quest.title} — Ben Hubbard` } : {};
}

export default async function SideQuestPage({ params }: Props) {
  const { slug } = await params;
  const quest = ownPages.find((q) => q.slug === slug);
  if (!quest) notFound();

  // Written-up quests have their own page; the rest are placeholders for now.
  if (quest.slug === "public-speaking") return <PublicSpeaking />;
  if (quest.slug === "cs-mentoring") return <Mentoring ground={sideQuestGround(quest)} />;
  if (quest.slug === "travel") return <Travel ground={sideQuestGround(quest)} />;
  return <ComingSoon title={quest.title} emoji={quest.emoji} ground={sideQuestGround(quest)} />;
}
