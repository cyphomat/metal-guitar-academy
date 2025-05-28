"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MdPlayArrow, MdLibraryMusic, MdTrendingUp, MdGroup, MdStar, MdMusicNote } from "react-icons/md"

const features = [
  {
    icon: MdPlayArrow,
    title: "Interactive Lessons",
    description: "Step-by-step video tutorials with interactive exercises",
  },
  {
    icon: MdLibraryMusic,
    title: "Song Library",
    description: "Learn your favorite metal classics with detailed breakdowns",
  },
  {
    icon: MdTrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics",
  },
  {
    icon: MdGroup,
    title: "Community",
    description: "Connect with fellow metalheads and share your progress",
  },
  {
    icon: MdMusicNote,
    title: "Interactive Tools",
    description: "Chord builders, rhythm trainers, and theory quizzes",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Smoke Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          <div className="smoke-animation"></div>
          <div className="smoke-animation smoke-delay-1"></div>
          <div className="smoke-animation smoke-delay-2"></div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Unleash Your</span>
              <br />
              <span className="text-white">Inner Riff</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">Metal & Rock guitar from zero to shred</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg">
                <Link href="/pathway">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg"
              >
                <Link href="/pathway">View Pathway</Link>
              </Button>
            </div>
          </motion.div>

          {/* Student Quote Callout */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <Card className="bg-gray-900/80 backdrop-blur-sm border-orange-500/30 max-w-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                  </div>
                  <div>
                    <blockquote className="text-gray-300 italic mb-3">
                      "I went from struggling with basic chords to shredding my favorite Metallica solos in just 3
                      months. The structured pathway and interactive exercises made all the difference!"
                    </blockquote>
                    <div>
                      <div className="text-orange-500 font-semibold">Marcus Rodriguez</div>
                      <div className="text-gray-400 text-sm">Student since 2023</div>
                    </div>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <MdStar key={i} className="h-4 w-4 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 gradient-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Why Choose Metal Guitar Academy?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors">
                  <CardHeader className="text-center">
                    {feature.icon && <feature.icon className="h-12 w-12 text-orange-500 mx-auto mb-4" />}
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
