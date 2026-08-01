import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthGate from "@/components/AuthGate";

// Display face for headings and the timing tower. Anton ships a single
// weight - see font-synthesis-weight in globals.css.
const anton = Anton({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Carries all numeric timing data - gaps, intervals, lap times
const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
    <html lang="en" className={`${anton.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-f1-dark text-f1-text antialiased font-sans">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
