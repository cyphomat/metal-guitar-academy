"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PowerChordTrainer } from "@/components/power-chord-trainer"
import { ChugsAndPalmMutes } from "@/components/chugs-palm-mutes"
import { MdPlayArrow, MdTimer, MdTrendingUp, MdMusicNote } from "react-icons/md"
import { PentatonicVisualizer } from "@/components/pentatonic-visualizer"
import Link from "next/link"

const exercises = {
  "power-chord": [
    {
      name: "Basic Power Chord Transitions",
      difficulty: "Beginner",
      duration: "5 min",
      description: "Practice moving between E5, A5, and D5 power chords",
      bpm: 60,
    },
    {
      name: "Power Chord Rhythm Patterns",
      difficulty: "Intermediate",
      duration: "8 min",
      description: "Master common metal rhythm patterns with power chords",
      bpm: 80,
    },
    {
      name: "Speed Power Chords",
      difficulty: "Advanced",
      duration: "10 min",
      description: "High-speed power chord progressions for metal songs",
      bpm: 120,
    },
  ],
  "palm-mute": [
    {
      name: "Palm Mute Basics",
      difficulty: "Beginner",
      duration: "6 min",
      description: "Learn proper palm muting technique and control",
      bpm: 70,
    },
    {
      name: "Palm Mute Rhythms",
      difficulty: "Intermediate",
      duration: "9 min",
      description: "Complex palm muted rhythm patterns",
      bpm: 90,
    },
    {
      name: "Galloping Rhythms",
      difficulty: "Advanced",
      duration: "12 min",
      description: "Master the galloping rhythm technique",
      bpm: 110,
    },
  ],
  pentatonic: [
    {
      name: "Pentatonic Scale Patterns",
      difficulty: "Beginner",
      duration: "7 min",
      description: "Learn the 5 positions of the pentatonic scale",
      bpm: 50,
    },
    {
      name: "Pentatonic Sequences",
      difficulty: "Intermediate",
      duration: "10 min",
      description: "Practice scale sequences and patterns",
      bpm: 80,
    },
    {
      name: "Pentatonic Shredding",
      difficulty: "Advanced",
      duration: "15 min",
      description: "High-speed pentatonic runs and licks",
      bpm: 140,
    },
  ],
}

export default function ExercisesPage() {
  const [activeTab, setActiveTab] = useState("power-chord")

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">Interactive Drills Hub</h1>
          <p className="text-xl text-gray-300">Sharpen your skills with targeted practice exercises</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8"
        >
          <Card className="bg-orange-900/20 border-orange-500/30 max-w-md mx-auto">
            <CardContent className="p-4">
              <p className="text-orange-400 text-sm mb-3">Looking for more interactive tools?</p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/components">
                  <MdMusicNote className="mr-2 h-4 w-4" />
                  Explore All Components
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="power-chord"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Power Chords
            </TabsTrigger>
            <TabsTrigger value="palm-mute" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Palm Muting
            </TabsTrigger>
            <TabsTrigger
              value="pentatonic"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Pentatonic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="power-chord" className="mt-8">
            {/* Power Chord Trainer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <PowerChordTrainer />
            </motion.div>

            {/* Exercise Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises["power-chord"].map((exercise, index) => (
                <motion.div
                  key={exercise.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            exercise.difficulty === "Beginner"
                              ? "secondary"
                              : exercise.difficulty === "Intermediate"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {exercise.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <MdTimer className="mr-1 h-4 w-4" />
                          {exercise.duration}
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                      <CardDescription className="text-gray-400">{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Target BPM:</span>
                          <span className="text-orange-500 font-semibold">{exercise.bpm}</span>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          <MdPlayArrow className="mr-2 h-4 w-4" />
                          Start Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="palm-mute" className="mt-8">
            {/* Chugs & Palm Mutes Trainer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <ChugsAndPalmMutes />
            </motion.div>

            {/* Exercise Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises["palm-mute"].map((exercise, index) => (
                <motion.div
                  key={exercise.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            exercise.difficulty === "Beginner"
                              ? "secondary"
                              : exercise.difficulty === "Intermediate"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {exercise.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <MdTimer className="mr-1 h-4 w-4" />
                          {exercise.duration}
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                      <CardDescription className="text-gray-400">{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Target BPM:</span>
                          <span className="text-orange-500 font-semibold">{exercise.bpm}</span>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          <MdPlayArrow className="mr-2 h-4 w-4" />
                          Start Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pentatonic" className="mt-8">
            {/* Pentatonic Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <PentatonicVisualizer />
            </motion.div>

            {/* Exercise Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises["pentatonic"].map((exercise, index) => (
                <motion.div
                  key={exercise.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            exercise.difficulty === "Beginner"
                              ? "secondary"
                              : exercise.difficulty === "Intermediate"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {exercise.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <MdTimer className="mr-1 h-4 w-4" />
                          {exercise.duration}
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                      <CardDescription className="text-gray-400">{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Target BPM:</span>
                          <span className="text-orange-500 font-semibold">{exercise.bpm}</span>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                          <MdPlayArrow className="mr-2 h-4 w-4" />
                          Start Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MdTrendingUp className="mr-2 h-5 w-5 text-orange-500" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">47</div>
                    <div className="text-gray-400">Exercises Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">12h</div>
                    <div className="text-gray-400">Practice Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">85%</div>
                    <div className="text-gray-400">Accuracy Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs>
      </div>
    </div>
  )
}
