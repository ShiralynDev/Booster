// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { TRPCProvider } from "@/trpc/client";
import { ThemeProvider } from "@/components/theme-provider";

const montserrat = Montserrat({ 
    subsets: ["latin"], 
    display: "swap",
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
    variable: '--font-montserrat'
});

export const metadata: Metadata = {
    metadataBase: new URL("https://www.boostervideos.net"),
    title: {
        default: "Booster",
        template: "%s | Booster",
    },
    description: "Video platform oriented for creators and users",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        url: "https://www.boostervideos.net/",
        siteName: "Booster",
        title: "Booster",
        description: "Video platform oriented for creators and users",
        images: [{ url: "/BoosterLongLogo.tmp.png", width: 1200, height: 630 }],
    },
    twitter: {
        card: "summary_large_image",
        site: "@your_handle",
    },
    icons: [
        { rel: "icon", url: "/favicon.ico" },
        { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    ],
};

export const viewport: Viewport = {
    themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0b0b0b" }, { color: "#ffffff" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning className={montserrat.variable}>
                <head>
                    <link rel="preconnect" href="https://vitals.vercel-analytics.com" crossOrigin="" />
                </head>
                <body className={`${montserrat.className} antialiased`}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <TRPCProvider>
                            {children}
                            <Toaster richColors closeButton />
                            <Analytics />
                        </TRPCProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

