import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LitAI — Your Personal Book Companion",
  description:
    "Upload any book. Talk to it naturally. LitAI is a voice-first reading companion that remembers every word and brings literature to life.",
  openGraph: {
    title: "LitAI — Your Personal Book Companion",
    description:
      "A voice-first reading companion that remembers every word of your book.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <ThemeProvider>
     <html lang="en" className="dark" suppressHydrationWarning>
      <QueryProvider>
        <AuthProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Navbar />
            <NextTopLoader color="#f59e0b" zIndex={99_999_999} />
            {children}
          </body>
        </AuthProvider>
      </QueryProvider>
    </html>
   </ThemeProvider>
  );
}
