import type React from "react"
import type { Metadata, Viewport } from "next"
import { Oswald } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ServiceWorker } from "@/components/service-worker"
import { asset } from "@/lib/base-path"

// Kondensiert und versal — trägt Tempi, Zahlen und Drill-Namen.
// next/font lädt sie beim Build herunter und liefert sie selbst aus, damit
// die App offline genauso aussieht wie online.
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "Metal Guitar Academy",
  description: "15 Minuten Metal-Gitarre am Tag — aufwärmen, eine Technik, ein Riff.",
  manifest: asset("/manifest.json"),
  appleWebApp: {
    capable: true,
    title: "Riff",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: asset("/icons/icon-192.png"),
    apple: asset("/icons/icon-180.png"),
  },
  other: {
    // Next 15 emits only the standard `mobile-web-app-capable`, which is the
    // Chrome spelling. Safari on iOS before 16.4 reads the apple-prefixed one
    // and without it the home-screen icon opens in a browser view instead of
    // standalone.
    "apple-mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
  // Fills the notch area on iPhone; the safe-area padding below keeps content
  // out from under it.
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`dark ${oswald.variable}`}>
      <body className="min-h-screen">
        <ServiceWorker />
        <Navigation />
        <main className="pb-[env(safe-area-inset-bottom)]">{children}</main>
      </body>
    </html>
  )
}
