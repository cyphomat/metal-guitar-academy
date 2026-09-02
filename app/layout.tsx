import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ServiceWorker } from "@/components/service-worker"
import { asset } from "@/lib/base-path"

const inter = Inter({ subsets: ["latin"] })

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
  themeColor: "#111111",
  // Fills the notch area on iPhone; the safe-area padding below keeps content
  // out from under it.
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#111] text-white`}>
        <ServiceWorker />
        <Navigation />
        <main
          className="pb-[env(safe-area-inset-bottom)]"
          style={{ paddingTop: "calc(4rem + env(safe-area-inset-top))" }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
