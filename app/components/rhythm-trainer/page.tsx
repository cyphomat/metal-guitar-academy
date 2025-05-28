"use client"

import { motion } from "framer-motion"
import { RhythmTrainer } from "@/components/rhythm-trainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MdArrowBack, MdAccessTime } from "react-icons/md"

export default function RhythmTrainerPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-orange-500 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-600">›</li>
            <li>
              <Link href="/components" className="hover:text-orange-500 transition-colors">
                Components
              </Link>
            </li>
            <li className="text-gray-600">›</li>
            <li className="text-orange-500 font-medium">Rhythm Trainer</li>
          </ol>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="outline" className="border-orange-500 text-orange-500">
              <Link href="/components">
                <MdArrowBack className="mr-2 h-4 w-4" />
                Back to Components
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center">
              <MdAccessTime className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Rhythm Trainer</h1>
              <p className="text-xl text-gray-300">Practice rhythm patterns with visual notation</p>
            </div>
          </div>
        </motion.div>

        {/* Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <RhythmTrainer />
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">Mastering Rhythm Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Basic Usage</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Press "Start Recording" to begin</li>
                    <li>• Tap SPACEBAR to match the rhythm</li>
                    <li>• Don't tap during rests</li>
                    <li>• Watch the orange beat indicator</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Scoring System</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>
                      • <span className="text-green-400">Tight</span>: 90%+ accuracy
                    </li>
                    <li>
                      • <span className="text-yellow-400">Good</span>: 70-89% accuracy
                    </li>
                    <li>
                      • <span className="text-red-400">Loose</span>: Below 70%
                    </li>
                    <li>• Timing tolerance: ±0.1 beats</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Practice Tips</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Start with simple quarter note patterns</li>
                    <li>• Focus on consistency over speed</li>
                    <li>• Use a metronome for daily practice</li>
                    <li>• Record yourself playing along</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
