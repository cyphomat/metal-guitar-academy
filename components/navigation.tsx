"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Heute" },
  { href: "/drills", label: "Drills" },
  { href: "/daten", label: "Daten" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-[640px] items-center gap-3 px-4">
        {/* Auf schmalen Geräten kleiner statt gekürzt: "Academy" allein sagt
            nichts, und drei Knöpfe brauchen den Platz. */}
        <Link
          href="/"
          className="display flex-1 truncate text-[15px] tracking-[0.04em] text-fg sm:text-[19px] sm:tracking-[0.05em]"
        >
          Metal Guitar <span className="text-akzent">Academy</span>
        </Link>

        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex-none border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                active
                  ? "border-akzent bg-[--tint-akzent] text-akzent"
                  : "border-line text-muted hover:border-stahl hover:text-stahl"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
