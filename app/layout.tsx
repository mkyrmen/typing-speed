import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
    title: "NeonType | Minimalist Speed Typing",
    description: "A fast, minimalist typing speed test app featuring real-time WPM tracking, dynamic themes, and a global leaderboard.",
};

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${jetbrains.className} antialiased`}>
                <Script
                    id="theme-init"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
(function () {
  try {
    var t = localStorage.getItem('typing.theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) {}
})();`,
                    }}
                />
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
