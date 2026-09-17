import type { Metadata } from "next";
import "./globals.css";

// Lumo uses custom fonts (TT Hoves Pro, Inter) defined as design tokens.
// Self-host them via next/font/local once the font files are exported
// from Figma, rather than fetching from Google Fonts.

export const metadata: Metadata = {
  title: "Lumo",
  description: "Lumo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lumo",
  },
};

export const viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
