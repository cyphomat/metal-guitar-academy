"use client"

import { motion } from "framer-motion"
import { LearningStepper } from "@/components/learning-stepper"

export default function PathwayPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">Learning Pathway</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Follow our structured 5-step journey from complete beginner to playing your first metal solo. Each step
            builds upon the previous one to ensure solid fundamentals.
          </p>
        </motion.div>

        <LearningStepper />
      </div>
    </div>
  )
}
