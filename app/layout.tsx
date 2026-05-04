import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Ben Hubbard",
  description: "Customer Success leader, runner/part time triathlete & maker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-24">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
