import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  openGraph: { title: SITE.title, description: SITE.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#060810",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} is-loading`}
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>{`html.is-loading{overflow:auto}[data-preloader]{display:none}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
