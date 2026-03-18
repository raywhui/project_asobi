import type { Metadata } from "next";
import { Geist, Raleway } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ProjectAsobi",
  description: "The Dnd Character Sheet That No One Asked For",
};

const geistMono = Geist({
  variable: "--font-mono",
  subsets: ["latin"],
});

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

// const pixelifySans = Pixelify_Sans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          // "font-sans",
          geistMono.className,
          raleway.className,
          // pixelifySans.className,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="rose-dark"
          // enableSystem
          enableColorScheme
          themes={["rose", "light", "dark", "rose-dark"]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
