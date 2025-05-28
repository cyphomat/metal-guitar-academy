"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChordBuilder } from "@/components/chord-builder"
import { RhythmTrainer } from "@/components/rhythm-trainer"
import { IntervalQuiz } from "@/components/interval-quiz"
import { ChordQuiz } from "@/components/chord-quiz"
import { PowerChordTrainer } from "@/components/power-chord-trainer"
import { PentatonicVisualizer } from "@/components/pentatonic-visualizer"
import { ChugsAndPalmMutes } from "@/components/chugs-palm-mutes"
import Link from "next/link"
import { MdMusicNote, MdPiano, MdAccessTime, MdElectricBolt, MdGraphicEq } from "react-icons/md"

const componentSections = [
  {
    id: "theory",
    title: "Theory Components",
    description: "Interactive tools for learning music theory",
    components: [
      {
        id: "chord-builder",
        title: "Chord Builder",
        description: "Build and visualize chords with audio playback",
        icon: MdPiano,
        component: ChordBuilder,
      },
      {
        id: "interval-quiz",
        title: "Interval Quiz",
        description: "Test your interval recognition skills",
        icon: MdMusicNote,
        component: IntervalQuiz,
      },
      {
        id: "chord-quiz",
        title: "Chord Quiz",
        description: "Practice chord identification and construction",
        icon: MdPiano,
        component: ChordQuiz,
      },
    ],
  },
  {
    id: "rhythm",
    title: "Rhythm Components",
    description: "Tools for developing timing and rhythm skills",
    components: [
      {
        id: "rhythm-trainer",
        title: "Rhythm Trainer",
        description: "Practice rhythm patterns with visual notation",
        icon: MdAccessTime,
        component: RhythmTrainer,
      },
    ],
  },
  {
    id: "guitar",
    title: "Guitar Components",
    description: "Guitar-specific learning tools and visualizers",
    components: [
      {
        id: "power-chord-trainer",
        title: "Power Chord Trainer",
        description: "Master power chords with metronome practice",
        icon: MdElectricBolt,
        component: PowerChordTrainer,
      },
      {
        id: "pentatonic-visualizer",
        title: "Pentatonic Visualizer",
        description: "Interactive fretboard for pentatonic scales",
        icon: MdGraphicEq,
        component: PentatonicVisualizer,
      },
      {
        id: "chugs-palm-mutes",
        title: "Chugs & Palm Mutes",
        description: "Practice essential metal techniques",
        icon: MdElectricBolt,
        component: ChugsAndPalmMutes,
      },
    ],
  },
]

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState("theory")

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
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
            <li className="text-orange-500 font-medium">Components</li>
          </ol>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">Interactive Components</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our collection of interactive learning tools designed to enhance your metal guitar journey. Each
            component offers hands-on practice and immediate feedback.
          </p>
        </motion.div>

        {/* Component Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800 mb-8">
            {componentSections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {componentSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-8">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-2">{section.title}</h2>
                <p className="text-gray-400">{section.description}</p>
              </motion.div>

              {/* Component Grid */}
              <div className="grid gap-8">
                {section.components.map((comp, index) => (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="space-y-6"
                  >
                    {/* Component Header */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
                            <comp.icon className="h-6 w-6 text-orange-500" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-xl">{comp.title}</CardTitle>
                            <CardDescription className="text-gray-400">{comp.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Component Demo */}
                    <div className="flex justify-center">
                      <comp.component />
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Usage Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">How to Use These Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Theory Components</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Use the Chord Builder to understand chord construction</li>
                    <li>• Take quizzes to test your theoretical knowledge</li>
                    <li>• Practice interval recognition for better ear training</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Practice Components</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Use the Rhythm Trainer to improve your timing</li>
                    <li>• Practice power chords with the metronome trainer</li>
                    <li>• Explore scales with the fretboard visualizer</li>
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
