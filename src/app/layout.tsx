import type { Metadata } from "next";
import { Geist, Geist_Mono, Grand_Hotel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const grandHotel = Grand_Hotel({
  weight: "400",
  variable: "--font-grand-hotel",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joel.POD",
  description: "POD Automation Dashboard",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${grandHotel.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Fredoka:wght@600;700;800&family=Gaegu:wght@400;700&family=Jua&family=Lilita+One&family=Pacifico&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var isChunkError = /Loading chunk .* failed|ERR_ABORTED.*\\.js/i.test(e.message || '') || 
                  (e.target && e.target.tagName === 'SCRIPT' && /_next\\/static\\/chunks/i.test(e.target.src || ''));
                if (isChunkError) {
                  if (!sessionStorage.getItem('chunk_reload_retry')) {
                    sessionStorage.setItem('chunk_reload_retry', 'true');
                    window.location.reload();
                  }
                }
              }, true);
              window.addEventListener('load', function() {
                sessionStorage.removeItem('chunk_reload_retry');
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>
          <div className="flex-1">{children}</div>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
