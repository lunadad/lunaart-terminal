import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeProvider from "@/components/ThemeProvider";


export const metadata: Metadata = {
  title: "LunaArt Terminal",
  description: "Art Market Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-[52px] md:pt-0">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
