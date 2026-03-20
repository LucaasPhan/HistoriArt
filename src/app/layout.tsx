import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LitCompanion — Your AI Reading Partner",
  description:
    "Read great books with an AI companion that understands the story. Ask questions, explore characters, and discuss themes with a warm, intelligent voice partner.",
  keywords: ["AI reading", "book companion", "literary analysis", "voice AI", "book discussion"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-noise">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
