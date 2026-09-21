import WorkClient, { type TabKey } from "./WorkClient";

type Props = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function WorkPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  // Anything unrecognised falls back to the Work tab.
  const activeTab: TabKey = tab === "side-quests" ? "side-quests" : "work";
  return <WorkClient activeTab={activeTab} />;
}
