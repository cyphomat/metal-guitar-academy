"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MdArrowBack, MdArrowForward, MdPlayArrow } from "react-icons/md"

// Mock lesson data
const lessonData = {
  title: "Power Chords Mastery",
  description: "Learn the foundation of metal guitar - the mighty power chord",
  duration: "15 minutes",
  difficulty: "Beginner",
  progress: 65,
  videoId: "dQw4w9WgXcQ", // YouTube video ID
  content: `
# Power Chords: The Foundation of Metal

Power chords are the backbone of metal music. They're simple, powerful, and essential for any aspiring metal guitarist.

## What is a Power Chord?

A power chord consists of just two notes:
- The root note
- The fifth interval

## Basic Power Chord Shape

The most common power chord shape uses:
- Index finger on the root note
- Ring finger on the fifth (two frets higher, one string lower)

## Practice Tips

1. **Keep your fingers curved** - This ensures clean notes
2. **Use the tip of your fingers** - Avoid touching other strings
3. **Practice slowly first** - Speed comes with accuracy
4. **Use a metronome** - Timing is crucial in metal

## Common Power Chord Progressions

Try these classic metal progressions:
- E5 - G5 - A5
- A5 - F5 - C5 - G5
- D5 - A5 - B5 - G5

Remember: Practice makes perfect! Start slow and gradually increase your speed.
  `,
}

export default function LessonPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="outline" className="border-orange-500 text-orange-500">
              <Link href="/pathway">
                <MdArrowBack className="mr-2 h-4 w-4" />
                Back to Pathway
              </Link>
            </Button>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{lessonData.difficulty}</Badge>
              <span className="text-gray-400">{lessonData.duration}</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 gradient-text">{lessonData.title}</h1>
          <p className="text-xl text-gray-300 mb-4">{lessonData.description}</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-orange-500">{lessonData.progress}%</span>
            </div>
            <Progress value={lessonData.progress} className="h-2" />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MdPlayArrow className="mr-2 h-5 w-5 text-orange-500" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${lessonData.videoId}`}
                    title="Lesson Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Lesson Notes</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <div
                  className="text-gray-300 space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: lessonData.content
                      .split("\n")
                      .map((line) => {
                        if (line.startsWith("# "))
                          return `<h1 class="text-2xl font-bold text-orange-500 mb-4">${line.slice(2)}</h1>`
                        if (line.startsWith("## "))
                          return `<h2 class="text-xl font-semibold text-white mb-3">${line.slice(3)}</h2>`
                        if (line.startsWith("- ")) return `<li class="ml-4">${line.slice(2)}</li>`
                        if (line.match(/^\d+\./)) return `<li class="ml-4">${line}</li>`
                        return line ? `<p class="mb-3">${line}</p>` : "<br>"
                      })
                      .join(""),
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-between mt-8"
        >
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <MdArrowBack className="mr-2 h-4 w-4" />
            Previous Lesson
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            Next Lesson
            <MdArrowForward className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
