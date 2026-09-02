import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Metal Guitar Academy",
  description: "15 Minuten Metal-Gitarre am Tag — aufwärmen, eine Technik, ein Riff.",
}

export const viewport: Viewport = {
  themeColor: "#111111",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#111] text-white`}>
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
