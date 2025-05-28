"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { MdArrowBack, MdPlayArrow, MdStar, MdStarBorder, MdAccessTime } from "react-icons/md"

export default function ForWhomTheBellTollsPage() {
  const difficulty = 2
  const techniques = ["Power-Chord", "Palm-Mute", "Open-Strings"]

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
              <Link href="/songs">
                <MdArrowBack className="mr-2 h-4 w-4" />
                Back to Songs
              </Link>
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">{renderStars()}</div>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                Easy
              </Badge>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 gradient-text">For Whom the Bell Tolls</h1>
          <p className="text-xl text-gray-300 mb-4">by Metallica</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-orange-500">0%</span>
            </div>
            <Progress value={0} className="h-2" />
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
                  Song Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/HNybmS3xNAQ?rel=0&modestbranding=1"
                    title="Metallica - For Whom the Bell Tolls (Live in Mexico City) [Orgullo, Pasión, y Gloria]"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  ></iframe>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center text-gray-400">
                    <MdAccessTime className="mr-1 h-4 w-4" />
                    5:09
                  </div>
                  <Badge className="bg-orange-600">Metallica</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-500">Key Techniques:</h4>
                  <div className="flex flex-wrap gap-2">
                    {techniques.map((technique) => (
                      <Badge key={technique} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {technique}
                      </Badge>
                    ))}
                  </div>
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
                <CardTitle className="text-white">Song Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  "For Whom the Bell Tolls" is one of Metallica's most iconic songs and an excellent introduction to
                  metal guitar techniques. This lesson will teach you the main riff, palm muting patterns, and the
                  song's structure.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-500">What You'll Learn:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Main riff using power chords and open strings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Palm muting technique for that chunky metal sound</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Galloping rhythm patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>Song structure and arrangement</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <MdPlayArrow className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tab Notation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Complete Guitar Tablature</CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Official tab from Ultimate Guitar - Standard tuning (E A D G B E)
                </p>
                <Badge variant="outline" className="border-green-500 text-green-400">
                  Verified Tab
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Intro */}
              <div>
                <h4 className="text-orange-500 font-semibold mb-3">Intro (1st Guitar)</h4>
                <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre">
                    {`F#5 F#5 E5

e|-----------|-----------|
B|-----------|-----------|
G|-----------|-----------|
D|-4-4-4-4---|---------2-|
A|-4-4-4-4---|---------2-|
E|-2-2-2-2---|-----------|`}
                  </pre>
                </div>
              </div>

              {/* Figure 1 */}
              <div>
                <h4 className="text-orange-500 font-semibold mb-3">Figure 1 (Both Guitars)</h4>
                <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre">
                    {`e|-------------|
B|-------------|
G|-------------|
D|-4-4-4-4-----|
A|-4-4-4-4--2--|
E|-2-2-2-2--0--| (x4)`}
                  </pre>
                </div>
              </div>

              {/* Figure 2 */}
              <div>
                <h4 className="text-orange-500 font-semibold mb-3">Figure 2 (Both Guitars)</h4>
                <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre">
                    {`e|-----------------------------------|
B|-----------------------------------|
G|-----------------------------------|
D|-2-2-5-4-3--2-5-4-3--2-5-4-3--2-5-4-3--6--|
A|-0-0-3-2-1--0-3-2-1--0-3-2-1--0-3-2-1--4--|
E|-----------------------------------4---| x2`}
                  </pre>
                </div>
              </div>

              {/* Figure 3 */}
              <div>
                <h4 className="text-orange-500 font-semibold mb-3">Figure 3 (The 1st Guitar Plays This)</h4>
                <p className="text-gray-400 text-sm mb-2">Chord progression: E5 G5 → E5 G5 C5 A5</p>
                <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre">
                    {`e|------------------------------|
B|------------------------------|
G|------------------------------|
D|-2---5---x---2---5---10---7---|
A|-2---3---x---2---3---10---7---|
E|-0---3---x---0---3---8----5---| x2`}
                  </pre>
                </div>
              </div>

              {/* Main Riff */}
              <div>
                <h4 className="text-orange-500 font-semibold mb-3">Main Riff (Simplified)</h4>
                <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-green-400 text-sm leading-relaxed whitespace-pre">
                    {`e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--0-0-0-0-3-3-3-3-5-5-5-5-3-3-3-|
E|--0-0-0-0-3-3-3-3-5-5-5-5-3-3-3-|
   P P P P   P P P   P P P   P P P

e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--0-0-0-0-2-2-2-2-0-0-0-0-------|
E|--0-0-0-0-2-2-2-2-0-0-0-0-------|
   P P P P   P P P   P P P`}
                  </pre>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-blue-400 font-semibold mb-2">Tab Legend</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <p>
                      <span className="text-orange-400">P</span> = Palm Mute
                    </p>
                    <p>
                      <span className="text-orange-400">0</span> = Open string
                    </p>
                    <p>
                      <span className="text-orange-400">x</span> = Muted string
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="text-orange-400">Numbers</span> = Fret positions
                    </p>
                    <p>
                      <span className="text-orange-400">x2, x4</span> = Repeat count
                    </p>
                    <p>
                      <span className="text-orange-400">|</span> = Bar line
                    </p>
                  </div>
                </div>
              </div>

              {/* Practice Tips */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-semibold mb-2">Practice Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Start with Figure 1 - it's the main riff that repeats throughout</li>
                  <li>• Focus on clean palm muting for the chunky metal sound</li>
                  <li>• Practice the chord changes in Figure 3 slowly before adding rhythm</li>
                  <li>• Use all downstrokes for authentic Metallica tone</li>
                  <li>• The intro sets the mood - make it dramatic and powerful</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Additional Learning Resources</CardTitle>
              <p className="text-gray-400 text-sm">
                Explore these trusted platforms for more tabs, lessons, and guitar learning content
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Tabster */}
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="https://sjc.microlink.io/ojuGk1NnUf2dxmo8cT8nr-hXJejQ-6PLBAQZskme_crg_lc-F5vo5Ef9j6YP3tqmH3h0H6pCtZM4Qsi8WrJulA.jpeg"
                      alt="Tabster - ASCII Tablature Editor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-orange-500 font-semibold">Tabster</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      Free, open-source ASCII tablature editor for creating and organizing guitar tabs
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                        Tab Editor
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        Free
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Ultimate Guitar */}
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="https://sjc.microlink.io/76_o6reruC8s9AJ_FQxjoORgtp6E9Amq7bV04-nCYDkehtHI3YPaRjexWIrQQrM41-vzfCZT0rLQZgKClH-JWw.jpeg"
                      alt="Ultimate Guitar - Guitar Tabs and Chords"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-orange-500 font-semibold">Ultimate Guitar</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      World's largest catalog of guitar tabs, chords, and backing tracks
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                        Tabs Database
                      </Badge>
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                        Backing Tracks
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* JustinGuitar */}
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src="https://sjc.microlink.io/YO9ZCJkGE6FocaPnqikohL0rGvElrkP6hifhgIkP-XxSQ0lpUcc7xghosf3hnLv1ebENuqb2ohbR7lnfN3a2kA.jpeg"
                      alt="JustinGuitar - Learn Guitar Online"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-orange-500 font-semibold">JustinGuitar</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      Comprehensive guitar courses from beginner to advanced with structured lessons
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                        Video Lessons
                      </Badge>
                      <Badge variant="outline" className="text-xs border-red-500 text-red-400">
                        Structured Course
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-400 font-semibold mb-2">Pro Tip</h4>
                <p className="text-gray-300 text-sm">
                  For "For Whom the Bell Tolls," check Ultimate Guitar for community-verified tabs, use Tabster to
                  create your own practice versions, and explore JustinGuitar's metal technique lessons to master the
                  palm muting and power chord techniques used in this song.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
