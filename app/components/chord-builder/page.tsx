"use client"

import { motion } from "framer-motion"
import { ChordBuilder } from "@/components/chord-builder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MdArrowBack, MdPiano } from "react-icons/md"

export default function ChordBuilderPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
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
            <li className="text-orange-500 font-medium">Chord Builder</li>
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
              <MdPiano className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Chord Builder</h1>
              <p className="text-xl text-gray-300">Build and visualize chords with audio playback</p>
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
          <ChordBuilder />
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">How to Use the Chord Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Getting Started</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Select a root note from the dropdown</li>
                    <li>• Choose a chord quality (Major, Minor, etc.)</li>
                    <li>• View the chord on the mini fretboard</li>
                    <li>• Click "Play Chord" to hear the harmony</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Learning Tips</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Notice how interval labels change with quality</li>
                    <li>• Try building the same chord in different positions</li>
                    <li>• Listen to how different qualities sound</li>
                    <li>• Practice identifying chord tones by ear</li>
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
