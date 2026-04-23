import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { GeminiBadge } from "@/components/GeminiBadge";
import { HistoryProvider } from "@/context/HistoryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FairMind AI - Bias Detection Platform",
  description: "Detect bias in text, datasets, and AI outputs. Fair decision intelligence platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} antialiased h-full overflow-hidden flex bg-background text-foreground`}>
        <HistoryProvider>
          <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80">
            <Sidebar />
          </div>
          <main className="md:pl-72 flex-1 h-full overflow-y-auto flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <footer className="py-6 flex justify-center border-t border-white/5 mt-auto">
              <GeminiBadge />
            </footer>
          </main>
        </HistoryProvider>
      </body>
    </html>
  );
}
