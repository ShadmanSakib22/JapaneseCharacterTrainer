import { Press_Start_2P, VT323, Orbitron } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ConvexClerkProvider } from "./ConvexClerkProvider";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "MOJI CRAWLER — Japanese Character Trainer",
  description: "Master Japanese characters in a retro RPG adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${pressStart2P.variable} ${vt323.variable} ${orbitron.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
