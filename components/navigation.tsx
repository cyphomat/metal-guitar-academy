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
      <div className="mx-auto flex h-14 max-w-[640px] items-center gap-3 px-4 wide:max-w-[1080px]">
        {/* Der Farbwechsel fällt zwischen zweitem und drittem F: "Riffforge"
            ist als Kompositum richtig geschrieben, aber drei gleiche Buchstaben
            in versaler Schrift liest man sonst nicht auseinander. */}
        <Link
          href="/"
          className="display flex-1 truncate text-[19px] tracking-[0.06em] text-fg"
        >
          Riff<span className="text-akzent">forge</span>
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
