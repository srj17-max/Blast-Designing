import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlastDesign Studio",
  description: "Interactive blast pattern, delay and performance design workspace.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
