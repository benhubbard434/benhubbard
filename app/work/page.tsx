import WorkClient from "./WorkClient";

type Props = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function WorkPage({ searchParams }: Props) {
  // Awaiting searchParams renders the page per request, so the first paint
  // already shows the right tab. Tab switches after that happen client-side.
  await searchParams;
  return <WorkClient />;
}
