import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingGuard } from "@/context/OnboardingGuard";
import { QueryProvider } from "@/context/QueryProvider";
import { LanguageProvider } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Source_Sans_3 } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "vietnamese"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "HistoriArt — Lịch sử Việt Nam qua trang sách sống động",
  description:
    "Nền tảng ebook lịch sử Việt Nam với hình ảnh, phim tư liệu và âm nhạc chèn thẳng vào từng trang sách. Đọc — xem — nghe — ôn tập.",
  openGraph: {
    title: "HistoriArt — Lịch sử Việt Nam qua trang sách sống động",
    description: "Nền tảng ebook lịch sử Việt Nam với đa phương tiện tương tác.",
    type: "website",
  },
};

import { verifySession } from "@/dal/verifySession";
import { db } from "@/drizzle/db";
import { userProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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
      <html
        lang="vi"
        className={`dark ${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} ${sourceSans.variable}`}
        suppressHydrationWarning
        data-scroll-behavior="smooth"
      >
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <OnboardingGuard onboardingComplete={onboardingComplete}>
                <body className="antialiased">
                  <Navbar />
                  <NextTopLoader color="#f59e0b" zIndex={99_999_999} />
                  {children}
                  <Analytics />
                </body>
              </OnboardingGuard>
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
      </html>
    </ThemeProvider>
  );
}
