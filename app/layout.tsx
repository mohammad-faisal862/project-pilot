import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectPilot AI — Choose the Right Career Project",
  description: "Your intelligent career co-pilot that scans your resume and GitHub, identifies skill gaps, and recommends professional-grade project roadmaps with dedicated AI mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <script dangerouslySetInnerHTML={{
            __html: `
              setInterval(() => {
                const elements = document.querySelectorAll('div[class*="cl-"]');
                for (let i = 0; i < elements.length; i++) {
                  if (elements[i].innerText && elements[i].innerText.includes('Configure your application')) {
                    elements[i].style.display = 'none';
                  }
                }
              }, 100);
            `
          }} />
        </body>
      </html>
    </ClerkProvider>
  );
}
