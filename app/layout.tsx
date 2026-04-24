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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col pb-[60px]">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
