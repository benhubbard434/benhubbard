import type { Metadata } from "next";
import BriefForm from "./BriefForm";

// Sent to clients directly, so it stays out of the nav and out of search.
export const metadata: Metadata = {
  title: "Website Project Brief — Ben Hubbard",
  description: "Tell me about your website project.",
  robots: { index: false, follow: false },
};

export default function WebsiteBriefPage() {
  return (
    <main
      data-full-bleed
      className="flex-1 flex items-start justify-center min-h-screen px-4 pt-16 pb-32"
      style={{
        background:
          "linear-gradient(135deg, var(--color-blue) 0%, var(--color-tomato-jam) 100%)",
      }}
    >
      <BriefForm />
    </main>
  );
}
