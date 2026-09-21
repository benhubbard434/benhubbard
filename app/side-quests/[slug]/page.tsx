import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sideQuests } from "@/lib/side-quests";

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

  // Blank for now.
  return <main className="flex-1" />;
}
