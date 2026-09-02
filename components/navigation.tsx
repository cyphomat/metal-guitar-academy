"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MdMusicNote } from "react-icons/md"

const navItems = [
  { href: "/", label: "Start" },
  { href: "/drills", label: "Drills" },
  { href: "/theory", label: "Theorie" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-orange-500/20 bg-[#111]/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <MdMusicNote className="h-7 w-7 rotate-12 text-orange-500" />
          <span className="text-lg font-bold text-white">Metal Guitar Academy</span>
        </Link>

        <div className="flex space-x-1">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded px-3 py-2 text-sm transition-colors ${
                  active ? "text-orange-500" : "text-gray-400 hover:text-orange-400"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
