"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MdMusicNote, MdGraphicEq, MdPiano, MdAccessTime, MdQuiz, MdTrendingUp } from "react-icons/md"
import { Button } from "@/components/ui/button"

const theoryTopics = [
  {
    title: "Notes & Intervals",
    description: "Learn the building blocks of music - notes, intervals, and how they relate to each other",
    icon: MdMusicNote,
    slug: "notes-intervals",
    difficulty: "Beginner",
    lessons: 8,
  },
  {
    title: "Scales",
    description: "Master major, minor, pentatonic, and modal scales essential for metal guitar",
    icon: MdGraphicEq,
    slug: "scales",
    difficulty: "Intermediate",
    lessons: 12,
  },
  {
    title: "Chords",
    description: "Understand chord construction, progressions, and how to build powerful metal harmonies",
    icon: MdPiano,
    slug: "chords",
    difficulty: "Intermediate",
    lessons: 10,
  },
  {
    title: "Rhythm",
    description: "Explore time signatures, rhythmic patterns, and the groove that drives metal music",
    icon: MdAccessTime,
    slug: "rhythm",
    difficulty: "Beginner",
    lessons: 6,
  },
  {
    title: "Quiz Hub",
    description: "Test your knowledge with interactive quizzes covering all aspects of music theory",
    icon: MdQuiz,
    slug: "quiz",
    difficulty: "All Levels",
    lessons: 25,
  },
]

export default function TheoryPage() {
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
            <li className="text-orange-500 font-medium">Theory</li>
          </ol>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">Music Theory Hub</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Build a solid foundation in music theory to unlock your full potential as a metal guitarist. Understanding
            the theory behind the music will help you write better riffs, solos, and songs.
          </p>
        </motion.div>

        {/* Theory Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {theoryTopics.map((topic, index) => (
            <motion.div
              key={topic.slug}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="h-full"
            >
              <Link href={`/theory/${topic.slug}`} className="block h-full">
                <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-300 h-full group">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                        <topic.icon className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{topic.title}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm leading-relaxed">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Difficulty and Lessons Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <MdTrendingUp className="h-4 w-4 text-orange-500" />
                          <span className="text-gray-400">Difficulty:</span>
                          <span className="text-white font-medium">{topic.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Lessons:</span>
                        <span className="text-orange-500 font-semibold">{topic.lessons}</span>
                      </div>

                      {/* Progress Bar Placeholder */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-500">0%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full w-0 transition-all duration-300 group-hover:w-2"></div>
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="pt-2">
                        <div className="w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-2 rounded-md text-sm font-medium transition-colors group-hover:bg-orange-700">
                          Start Learning
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Add this after the theory topics grid, before the stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-orange-900/20 border-orange-500/30 max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-orange-400">Theorie in die Finger kriegen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Theorie sitzt erst, wenn sie unter den Fingern war. Die Drills verbinden beides.
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href="/drills">
                  <MdMusicNote className="mr-2 h-4 w-4" />
                  Zu den Drills
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">Theory Tips for Metal Guitarists</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Start with Notes & Intervals to understand the fretboard better</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Learn scales to improve your lead guitar and improvisation skills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Understanding chords will help you write better progressions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Rhythm theory is crucial for tight, professional-sounding metal</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
