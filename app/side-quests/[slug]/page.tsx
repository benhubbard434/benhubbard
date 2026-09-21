import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sideQuests } from "@/lib/side-quests";

// Only the side quests listed in lib/side-quests.ts exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return sideQuests.map((quest) => ({ slug: quest.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quest = sideQuests.find((q) => q.slug === slug);
  return quest ? { title: `${quest.title} — Ben Hubbard` } : {};
}

export default async function SideQuestPage({ params }: Props) {
  const { slug } = await params;
  const quest = sideQuests.find((q) => q.slug === slug);
  if (!quest) notFound();

  // Blank for now.
  return <main className="flex-1" />;
}
