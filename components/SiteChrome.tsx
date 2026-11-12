"use client";

import { usePathname } from "next/navigation";

/** Sections that stand apart from the site and carry none of its navigation. */
const STANDALONE = ["/secret-santa"];

/** Renders the site's nav and tab rail everywhere except standalone sections. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (STANDALONE.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return null;
  return <>{children}</>;
}
