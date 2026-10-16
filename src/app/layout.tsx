import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import { VocabularyProvider } from "@/components/VocabularyProvider";
import { ProGateProvider } from "@/components/ProGateProvider";
import { getAreaForCurrentUser } from "@/lib/vocabulary-server";
import { getGateStateForCurrentUser } from "@/lib/pro-gate-server";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

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

type LayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: LayoutProps) {
  const area = await getAreaForCurrentUser();
  const gateState = await getGateStateForCurrentUser();

  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-200">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden bg-white shadow-xl">
          <VocabularyProvider area={area}>
            <ProGateProvider gateState={gateState}>
              <PageTransition>{children}</PageTransition>
            </ProGateProvider>
          </VocabularyProvider>
        </div>
      </body>
    </html>
  );
}
