import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";

import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { OnboardingGuard } from "@/context/OnboardingGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LitCompanion — Your Personal Book Companion",
  description:
    "Upload any book. Talk to it naturally. LitCompanion is a voice-first reading companion that remembers every word and brings literature to life.",
  openGraph: {
    title: "LitCompanion — Your Personal Book Companion",
    description:
      "A voice-first reading companion that remembers every word of your book.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();
  let onboardingComplete = true; // default true for guests or completed users

  if (session?.user?.id) {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, session.user.id),
      columns: { onboardingComplete: true },
    });
    // if no profile yet, or it's not complete -> false
    onboardingComplete = profile?.onboardingComplete ?? false;
  }

  return (
   <ThemeProvider>
     <html lang="en" className="dark" suppressHydrationWarning>
      <QueryProvider>
        <AuthProvider>
          <OnboardingGuard onboardingComplete={onboardingComplete}>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <Navbar />
              <NextTopLoader color="#f59e0b" zIndex={99_999_999} />
              {children}
            </body>
          </OnboardingGuard>
        </AuthProvider>
      </QueryProvider>
    </html>
   </ThemeProvider>
  );
}
