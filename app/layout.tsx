import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
});

const abrah = localFont({
  src: "../public/fonts/Abrah.woff2",
  variable: "--font-abrah",
  display: "swap",
});

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
    <html lang="en" className={`${googleSansFlex.variable} ${abrah.variable}`}>
      <body className="min-h-screen pb-24">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
