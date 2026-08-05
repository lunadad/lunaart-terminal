import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeProvider from "@/components/ThemeProvider";

const themeInitScript = `
(() => {
  try {
    const saved = localStorage.getItem('artpan-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch {}
})();
`;

export const metadata: Metadata = {
  title: "LunaArt Terminal",
  description: "Art Market Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <div className="min-h-screen">
            <Sidebar />
            <main className="pb-20 md:pb-0">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
