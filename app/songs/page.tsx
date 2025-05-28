"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SongCard } from "@/components/song-card"
import { MdSearch, MdTrendingUp } from "react-icons/md"

const songs = [
  {
    title: "For Whom the Bell Tolls",
    artist: "Metallica",
    difficulty: 2,
    duration: "5:09",
    techniques: ["Power-Chord", "Palm-Mute", "Open-Strings"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    slug: "for-whom-the-bell-tolls",
    description: "Master this metal classic with detailed breakdowns of the iconic main riff",
  },
  {
    title: "Master of Puppets",
    artist: "Metallica",
    difficulty: 4,
    duration: "8:35",
    techniques: ["Power-Chord", "Palm-Mute", "Lead-Guitar"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    slug: "master-of-puppets",
    description: "Advanced techniques including downpicking and complex rhythms",
  },
  {
    title: "Iron Man",
    artist: "Black Sabbath",
    difficulty: 1,
    duration: "5:56",
    techniques: ["Power-Chord", "Open-Strings"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    slug: "iron-man",
    description: "Perfect beginner song with simple but effective power chord progressions",
  },
  {
    title: "Paranoid",
    artist: "Black Sabbath",
    difficulty: 2,
    duration: "2:50",
    techniques: ["Power-Chord", "Basic-Lead"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    slug: "paranoid",
    description: "Classic metal anthem with accessible lead guitar sections",
  },
  {
    title: "Holy Diver",
    artist: "Dio",
    difficulty: 3,
    duration: "5:53",
    techniques: ["Power-Chord", "Lead-Guitar", "String-Bending"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    slug: "holy-diver",
    description: "Intermediate level with melodic lead work and expressive bending",
  },
  {
    title: "Ace of Spades",
    artist: "Motörhead",
    difficulty: 3,
    duration: "2:49",
    techniques: ["Fast-Picking", "Power-Chord"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    slug: "ace-of-spades",
    description: "High-energy track focusing on speed and precision",
  },
]

export default function SongsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSongs, setFilteredSongs] = useState(songs)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(term.toLowerCase()) ||
        song.artist.toLowerCase().includes(term.toLowerCase()) ||
        song.techniques.some((tech) => tech.toLowerCase().includes(term.toLowerCase())),
    )
    setFilteredSongs(filtered)
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">Song Library</h1>
          <p className="text-xl text-gray-300 mb-8">Master your favorite metal classics with detailed breakdowns</p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search songs, artists, or techniques..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Featured Song */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Featured Song</h2>
          <div className="max-w-md mx-auto">
            <SongCard
              title="For Whom the Bell Tolls"
              artist="Metallica"
              difficulty={2}
              duration="5:09"
              techniques={["Power-Chord", "Palm-Mute", "Open-Strings"]}
              thumbnail="/placeholder.svg?height=200&width=300"
              slug="for-whom-the-bell-tolls"
              description="Master this metal classic with detailed breakdowns of the iconic main riff and galloping rhythm patterns"
            />
          </div>
        </motion.div>

        {/* All Songs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">All Songs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song, index) => (
              <motion.div
                key={song.slug}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <SongCard
                  title={song.title}
                  artist={song.artist}
                  difficulty={song.difficulty}
                  duration={song.duration}
                  techniques={song.techniques}
                  thumbnail={song.thumbnail}
                  slug={song.slug}
                  description={song.description}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {filteredSongs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-gray-400 text-lg">No songs found matching your search.</p>
          </motion.div>
        )}

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
                Your Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">3</div>
                  <div className="text-gray-400">Songs Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">8h</div>
                  <div className="text-gray-400">Practice Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">92%</div>
                  <div className="text-gray-400">Average Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
