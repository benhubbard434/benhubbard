"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "BLOG", href: "/blog" },
  { label: "WORK", href: "/work" },
  { label: "RUNNING", href: "/running" },
  { label: "MUSIC", href: "/music" },
  { label: "CONTACT", href: "/contact" },
];

type SocialLink = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type Props = {
  open: boolean;
  onClose: () => void;
  socialLinks: SocialLink[];
};

export default function MenuOverlay({ open, onClose, socialLinks }: Props) {
  const pathname = usePathname();
  // Tracks whether the panel has been mounted at least once — avoids rendering
  // it in the DOM on the initial page load before it's ever been opened.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        backgroundColor: "#c4392c",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 550ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col justify-center px-8 gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-inktrap text-white leading-none hover:opacity-70 transition-opacity"
            style={{ fontSize: "clamp(2rem, 7vh, 5rem)" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-8 pb-4 flex flex-col gap-3">
        <div className="flex gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-white hover:opacity-70 transition-opacity"
            >
              {link.icon}
            </a>
          ))}
        </div>
        <p className="text-white/60 text-sm">
          © {new Date().getFullYear()} Ben Hubbard &nbsp;·&nbsp;{" "}
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          &nbsp;·&nbsp;{" "}
          <Link href="/ai-usage" className="hover:text-white transition-colors">
            AI Usage
          </Link>
        </p>
      </div>
    </div>
  );
}
