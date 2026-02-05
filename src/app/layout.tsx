import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

const amiri = Amiri({
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "Aura-Link | Assistant Sadaqa - Plateforme d'Entraide Citoyenne",
  description: "Plateforme d'assistance territoriale intelligente pour les associations caritatives de Casablanca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.classList.add(theme);
                  } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${cairo.variable} ${amiri.variable}`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
