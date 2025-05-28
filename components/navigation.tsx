"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { MdMusicNote } from "react-icons/md"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pathway", label: "Learning Path" },
  { href: "/exercises", label: "Exercises" },
  { href: "/theory", label: "Theory" },
  { href: "/songs", label: "Songs" },
  { href: "/components", label: "Components" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-sm border-b border-orange-500/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <MdMusicNote className="h-8 w-8 text-orange-500 transform rotate-12" />
          <span className="text-xl font-bold gradient-text">Metal Guitar Academy</span>
        </Link>

        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-2 transition-colors ${
                pathname === item.href ? "text-orange-500" : "text-gray-300 hover:text-orange-400"
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" layoutId="activeTab" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
