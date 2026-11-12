import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./santa.css";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-jost", display: "swap" });

// Private: shared with family directly, so it stays out of search and the nav.
export const metadata: Metadata = {
  title: "Secret Santa",
  description: "",
  robots: { index: false, follow: false, nocache: true },
};

export default function SantaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`santa ${jost.variable}`} data-full-bleed>
      <div className="santa-band" aria-hidden="true" />
      <main className="santa-main">{children}</main>
      <div className="santa-band" aria-hidden="true" />
    </div>
  );
}
