import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
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
  title: "Historiart — Lịch sử Việt Nam qua trang sách sống động",
  description:
    "Nền tảng ebook lịch sử Việt Nam với hình ảnh, phim tư liệu và âm nhạc chèn thẳng vào từng trang sách. Đọc — xem — nghe — ôn tập.",
  openGraph: {
    title: "Historiart — Lịch sử Việt Nam qua trang sách sống động",
    description:
      "Nền tảng ebook lịch sử Việt Nam với đa phương tiện tương tác.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <ThemeProvider>
     <html lang="vi" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <QueryProvider>
        <AuthProvider>
          <OnboardingGuard>
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
