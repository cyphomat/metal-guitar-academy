"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MdArrowBack, MdQuiz, MdCheckCircle } from "react-icons/md"

interface TheoryContent {
  title: string
  description: string
  difficulty: string
  duration: string
  hasQuiz: boolean
  keyPoints: string[]
  content: string
}

interface AsideCardProps {
  keyPoints: string[]
  hasQuiz: boolean
  slug: string
}

function AsideCard({ keyPoints, hasQuiz, slug }: AsideCardProps) {
  return (
    <div className="space-y-6">
      {/* Key Points */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Key Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start text-sm">
                <MdCheckCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Quiz Button */}
      {hasQuiz && (
        <Card className="bg-orange-900/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <MdQuiz className="h-8 w-8 text-orange-500 mx-auto" />
              <div>
                <h3 className="text-white font-semibold">Test Your Knowledge</h3>
                <p className="text-gray-400 text-sm">Take the quiz to reinforce what you've learned</p>
              </div>
              <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                <Link href={`/theory/${slug}/quiz`}>
                  <MdQuiz className="mr-2 h-4 w-4" />
                  Start Quiz
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface TheoryClientPageProps {
  params: {
    slug: string
  }
  content: TheoryContent
}

export default function TheoryClientPage({ params, content }: TheoryClientPageProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <motion.div className="fixed top-16 left-0 right-0 h-1 bg-orange-600 origin-left z-40" style={{ scaleX }} />

      <div className="py-20 px-4">
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
              <li className="text-orange-500 font-medium">{content.title}</li>
            </ol>
          </motion.nav>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <Button asChild variant="outline" className="border-orange-500 text-orange-500">
                    <Link href="/theory">
                      <MdArrowBack className="mr-2 h-4 w-4" />
                      Back to Theory
                    </Link>
                  </Button>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {content.difficulty}
                    </Badge>
                    <span className="text-gray-400 text-sm">{content.duration}</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold mb-2 gradient-text">{content.title}</h1>
                <p className="text-xl text-gray-300 mb-6">{content.description}</p>
              </motion.div>

              {/* HTML Content */}
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg dark:prose-invert max-w-3xl mx-auto pb-20"
              >
                <div className="text-gray-300 space-y-6" dangerouslySetInnerHTML={{ __html: content.content }} />
              </motion.article>
            </div>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <AsideCard keyPoints={content.keyPoints} hasQuiz={content.hasQuiz} slug={params.slug} />
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </div>
  )
}
