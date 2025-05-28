import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Metal Guitar Academy",
  description: "Unleash Your Inner Riff - Master Metal Guitar",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#111] text-white min-h-screen`}>
        <Navigation />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
