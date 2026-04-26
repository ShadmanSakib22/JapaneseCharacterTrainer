import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KANA QUEST — Japanese Character Trainer",
  description: "Master Japanese characters in a retro RPG adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
