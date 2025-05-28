"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  MdCheckCircle,
  MdPlayCircleOutline,
  MdLock,
  MdMusicNote,
  MdElectricBolt,
  MdGraphicEq,
  MdTrendingUp,
  MdStar,
} from "react-icons/md"

interface StepData {
  id: number
  title: string
  description: string
  lessons: string[]
  status: "completed" | "current" | "locked"
  duration: string
  icon: React.ComponentType<{ className?: string }>
}

const steps: StepData[] = [
  {
    id: 1,
    title: "Gear Basics",
    description: "Essential equipment, setup, and basic guitar knowledge",
    lessons: ["Guitar Anatomy", "Amp Settings", "Pick Selection", "Tuning"],
    status: "completed",
    duration: "1 week",
    icon: MdMusicNote,
  },
  {
    id: 2,
    title: "Power-Chords",
    description: "Master the foundation of metal - power chord techniques",
    lessons: ["Basic Power Chords", "Chord Transitions", "Muting Techniques"],
    status: "completed",
    duration: "2 weeks",
    icon: MdElectricBolt,
  },
  {
    id: 3,
    title: "Rhythm Riffs",
    description: "Learn essential metal rhythm patterns and palm muting",
    lessons: ["Palm Muting", "Galloping Rhythms", "Syncopation", "Metal Riffs"],
    status: "current",
    duration: "3 weeks",
    icon: MdGraphicEq,
  },
  {
    id: 4,
    title: "Lead Pentatonics",
    description: "Introduction to lead guitar with pentatonic scales",
    lessons: ["Pentatonic Patterns", "String Bending", "Vibrato", "Basic Licks"],
    status: "locked",
    duration: "4 weeks",
    icon: MdTrendingUp,
  },
  {
    id: 5,
    title: "First Solo",
    description: "Put it all together with your first complete guitar solo",
    lessons: ["Solo Structure", "Phrasing", "Complete Solo", "Performance Tips"],
    status: "locked",
    duration: "2 weeks",
    icon: MdStar,
  },
]

export function LearningStepper() {
  const currentStepIndex = steps.findIndex((step) => step.status === "current")
  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length
  const progressPercentage = ((completedSteps + (currentStepIndex >= 0 ? 0.5 : 0)) / totalSteps) * 100

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar at Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-white text-lg">Learning Progress</CardTitle>
              <Badge variant="outline" className="border-orange-500 text-orange-500">
                Step {currentStepIndex + 1} of {totalSteps}
              </Badge>
            </div>
            <CardDescription className="text-gray-400">
              {completedSteps} completed • {totalSteps - completedSteps - (currentStepIndex >= 0 ? 1 : 0)} remaining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-orange-500 font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vertical Stepper */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700"></div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex items-start"
            >
              {/* Step indicator circle */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 border-4 border-orange-500 shadow-lg">
                {step.status === "completed" && <MdCheckCircle className="h-8 w-8 text-green-500" />}
                {step.status === "current" && <MdPlayCircleOutline className="h-8 w-8 text-orange-500" />}
                {step.status === "locked" && <MdLock className="h-8 w-8 text-gray-500" />}
              </div>

              {/* Step content */}
              <div className="ml-8 flex-1">
                <Card
                  className={`bg-gray-900/50 border-gray-800 transition-all duration-300 ${
                    step.status === "current"
                      ? "border-orange-500/50 shadow-lg shadow-orange-500/20"
                      : step.status === "completed"
                        ? "border-green-500/30"
                        : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <step.icon className="h-6 w-6 text-orange-500" />
                        <CardTitle className="text-white text-xl">{step.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            step.status === "completed"
                              ? "default"
                              : step.status === "current"
                                ? "destructive"
                                : "secondary"
                          }
                          className={
                            step.status === "completed"
                              ? "bg-green-600 hover:bg-green-700"
                              : step.status === "current"
                                ? "bg-orange-600 hover:bg-orange-700"
                                : ""
                          }
                        >
                          {step.status === "completed"
                            ? "Completed"
                            : step.status === "current"
                              ? "In Progress"
                              : "Locked"}
                        </Badge>
                        <span className="text-sm text-gray-400">{step.duration}</span>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400 mt-2">{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-orange-500 mb-3">What you'll learn:</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {step.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="text-gray-300 flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></span>
                              <span className="text-sm">{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-400">
                          Step {step.id} of {totalSteps}
                        </div>
                        <Button
                          asChild={step.status !== "locked"}
                          disabled={step.status === "locked"}
                          className={
                            step.status === "completed"
                              ? "bg-green-600 hover:bg-green-700"
                              : step.status === "current"
                                ? "bg-orange-600 hover:bg-orange-700"
                                : ""
                          }
                        >
                          {step.status === "locked" ? (
                            <span>Complete Previous Steps</span>
                          ) : (
                            <Link href={`/lessons/${step.title.toLowerCase().replace(/\s+/g, "-")}`}>
                              {step.status === "completed" ? "Review Lessons" : "Start Learning"}
                            </Link>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Completion Message */}
      {completedSteps === totalSteps && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-green-900/50 to-orange-900/50 border-green-500/50">
            <CardContent className="p-6 text-center">
              <MdStar className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
              <p className="text-gray-300">You've completed the foundational pathway. Ready for advanced techniques?</p>
              <Button className="mt-4 bg-orange-600 hover:bg-orange-700">Explore Advanced Courses</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
