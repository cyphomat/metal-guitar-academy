"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MdPlayArrow, MdStar, MdStarBorder } from "react-icons/md"

interface SongCardProps {
  title: string
  artist: string
  thumbnail: string
  difficulty: number
  techniques: string[]
  slug: string
  duration?: string
  description?: string
}

export function SongCard({
  title,
  artist,
  thumbnail,
  difficulty,
  techniques,
  slug,
  duration = "5:09",
  description = "Master this metal classic with detailed breakdowns",
}: SongCardProps) {
  // Generate star rating display
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < difficulty
      return isFilled ? (
        <MdStar key={index} className="h-4 w-4 text-yellow-500" />
      ) : (
        <MdStarBorder key={index} className="h-4 w-4 text-gray-400" />
      )
    })
  }

  // Get difficulty label
  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner"
      case 2:
        return "Easy"
      case 3:
        return "Intermediate"
      case 4:
        return "Advanced"
      case 5:
        return "Expert"
      default:
        return "Unknown"
    }
  }

  // Get technique color
  const getTechniqueColor = (technique: string) => {
    switch (technique.toLowerCase()) {
      case "power-chord":
        return "bg-orange-600/20 text-orange-400 border-orange-500/30"
      case "palm-mute":
        return "bg-blue-600/20 text-blue-400 border-blue-500/30"
      case "open-strings":
        return "bg-green-600/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3, ease: "easeOut" }} className="h-full">
      <Card className="bg-gray-900/50 border-gray-800 hover:border-orange-500/50 transition-all duration-300 h-full overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail || "/placeholder.svg"}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Duration badge */}
          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-none">{duration}</Badge>

          {/* Play overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
              className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center"
            >
              <MdPlayArrow className="h-8 w-8 text-white ml-1" />
            </motion.div>
          </motion.div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-white text-lg leading-tight">{title}</CardTitle>
              <CardDescription className="text-gray-400 text-sm">by {artist}</CardDescription>
            </div>
          </div>

          {/* Difficulty Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Difficulty:</span>
              <div className="flex items-center space-x-1">{renderStars()}</div>
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                {getDifficultyLabel(difficulty)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-gray-400 text-sm">{description}</p>

          {/* Techniques */}
          <div>
            <h4 className="text-sm font-semibold text-orange-500 mb-2">Key Techniques:</h4>
            <div className="flex flex-wrap gap-2">
              {techniques.map((technique) => (
                <Badge key={technique} variant="outline" className={`text-xs ${getTechniqueColor(technique)}`}>
                  {technique}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 group">
            <Link href={`/songs/${slug}`}>
              <MdPlayArrow className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Start Lesson
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
