import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Titillium_Web } from "next/font/google";
import "./globals.css";
import AuthGate from "@/components/AuthGate";

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const titilliumWeb = Titillium_Web({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-titillium-web",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PitWall",
  description: "Formula 1 live timing, race replay, and telemetry visualization",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${titilliumWeb.variable}`}>
      <body className="bg-f1-dark text-f1-text antialiased font-sans">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
