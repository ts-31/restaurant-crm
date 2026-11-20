import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { TopLoaderProvider } from "@/components/ui/TopLoader";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});


export const metadata: Metadata = {
  title: "TableFlow — Restaurant QR Ordering",
  description: "Scan, order, enjoy. Contactless QR table ordering for modern restaurants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className={`${cormorant.variable} ${jost.variable} antialiased`}>
        <Suspense fallback={null}>
          <TopLoaderProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </TopLoaderProvider>
        </Suspense>
      </body>
    </html>
  );
}
