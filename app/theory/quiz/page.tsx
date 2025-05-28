"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { MdArrowBack, MdQuiz, MdShuffle, MdMusicNote, MdPiano, MdAccessTime } from "react-icons/md"
import { IntervalQuiz } from "@/components/interval-quiz"
import { ChordQuiz } from "@/components/chord-quiz"
import { RhythmTrainer } from "@/components/rhythm-trainer"

const quizTypes = [
  {
    id: "interval",
    title: "Interval Quiz",
    description: "Test your ability to identify musical intervals on the fretboard",
    icon: MdMusicNote,
    difficulty: "Beginner",
    questions: 10,
    duration: "5-8 min",
    color: "from-orange-600 to-red-600",
  },
  {
    id: "chord",
    title: "Chord Quiz",
    description: "Identify chord types and build chords from given notes",
    icon: MdPiano,
    difficulty: "Intermediate",
    questions: 15,
    duration: "8-12 min",
    color: "from-blue-600 to-purple-600",
  },
  {
    id: "rhythm",
    title: "Rhythm Trainer",
    description: "Practice rhythm patterns and improve your timing accuracy",
    icon: MdAccessTime,
    difficulty: "All Levels",
    questions: "Unlimited",
    duration: "Variable",
    color: "from-green-600 to-teal-600",
  },
]

export default function QuizPage() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openQuiz = (quizId: string) => {
    setActiveQuiz(quizId)
    setIsModalOpen(true)
  }

  const closeQuiz = () => {
    setActiveQuiz(null)
    setIsModalOpen(false)
  }

  const openRandomQuiz = () => {
    const randomQuiz = quizTypes[Math.floor(Math.random() * quizTypes.length)]
    openQuiz(randomQuiz.id)
  }

  const renderQuizComponent = () => {
    switch (activeQuiz) {
      case "interval":
        return <IntervalQuiz />
      case "chord":
        return <ChordQuiz />
      case "rhythm":
        return <RhythmTrainer />
      default:
        return null
    }
  }

  const getQuizTitle = () => {
    const quiz = quizTypes.find((q) => q.id === activeQuiz)
    return quiz?.title || "Quiz"
  }

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
              <Link href="/theory" className="hover:text-orange-500 transition-colors">
                Theory
              </Link>
            </li>
            <li className="text-gray-600">›</li>
            <li className="text-orange-500 font-medium">Quiz Hub</li>
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
              <Link href="/theory">
                <MdArrowBack className="mr-2 h-4 w-4" />
                Back to Theory
              </Link>
            </Button>
            <Button onClick={openRandomQuiz} className="bg-purple-600 hover:bg-purple-700">
              <MdShuffle className="mr-2 h-4 w-4" />
              Random Quiz
            </Button>
          </div>

          <h1 className="text-5xl font-bold mb-4 gradient-text">Interactive Quiz Hub</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Test your music theory knowledge with interactive quizzes. Choose a specific topic or try a random quiz to
            challenge yourself!
          </p>
        </motion.div>

        {/* Quiz Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quizTypes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="h-full"
            >
              <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-300 h-full group cursor-pointer">
                <div className={`h-2 bg-gradient-to-r ${quiz.color} rounded-t-lg`} />
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${quiz.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <quiz.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl mb-2">{quiz.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm leading-relaxed">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Quiz Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Difficulty:</span>
                        <div className="font-medium text-white">{quiz.difficulty}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <div className="font-medium text-white">{quiz.duration}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Questions:</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {quiz.questions}
                      </Badge>
                    </div>

                    {/* Progress Placeholder */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Best Score</span>
                        <span className="text-gray-500">--</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-0 transition-all duration-300 group-hover:w-4"></div>
                      </div>
                    </div>

                    {/* Start Button */}
                    <Button
                      onClick={() => openQuiz(quiz.id)}
                      className={`w-full bg-gradient-to-r ${quiz.color} hover:opacity-90 text-white font-medium transition-all duration-300 group-hover:shadow-lg`}
                    >
                      <MdQuiz className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MdQuiz className="mr-2 h-5 w-5 text-orange-500" />
                Your Quiz Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">0</div>
                  <div className="text-gray-400">Quizzes Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">0%</div>
                  <div className="text-gray-400">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">0</div>
                  <div className="text-gray-400">Perfect Scores</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">0</div>
                  <div className="text-gray-400">Study Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400">Quiz Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Before Starting:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Review the relevant theory lessons first</li>
                    <li>• Practice with your guitar for hands-on learning</li>
                    <li>• Take your time - accuracy over speed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">During Quizzes:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Read questions carefully</li>
                    <li>• Use process of elimination</li>
                    <li>• Learn from explanations after each answer</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quiz Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="lg:w-[600px] max-w-[95vw] bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">{getQuizTitle()}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">{renderQuizComponent()}</div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
