import type { Metadata } from "next";
import { Archivo, Google_Sans_Flex, Instrument_Serif } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import GlobalTabRail from "@/components/GlobalTabRail";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: "900",
  style: "italic",
  variable: "--font-archivo",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
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
    <html lang="en" className={`${googleSansFlex.variable} ${archivo.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen pb-24">
        <GlobalTabRail />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
