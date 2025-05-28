"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MdCheckCircle, MdWarning, MdError, MdInfo } from "react-icons/md"

interface AccuracyMetrics {
  chordAccuracy: number
  intervalAccuracy: number
  fretboardAccuracy: number
  theoryCompliance: number
  overallScore: number
}

interface AccuracyIssue {
  type: "error" | "warning" | "info"
  category: string
  description: string
  suggestion?: string
}

export function AccuracyReport() {
  // This would be populated by actual validation results
  const metrics: AccuracyMetrics = {
    chordAccuracy: 95,
    intervalAccuracy: 98,
    fretboardAccuracy: 92,
    theoryCompliance: 96,
    overallScore: 95,
  }

  const issues: AccuracyIssue[] = [
    {
      type: "warning",
      category: "Chord Voicings",
      description: "Some chord voicings may be difficult for beginners",
      suggestion: "Consider adding easier alternative voicings",
    },
    {
      type: "info",
      category: "Frequency Calculation",
      description: "All frequencies calculated using equal temperament tuning",
    },
    {
      type: "error",
      category: "Fretboard Range",
      description: "2 chord positions exceed comfortable fret range",
      suggestion: "Limit chord suggestions to first 12 frets for beginners",
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-500"
    if (score >= 85) return "text-yellow-500"
    return "text-red-500"
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <MdError className="h-4 w-4 text-red-500" />
      case "warning":
        return <MdWarning className="h-4 w-4 text-yellow-500" />
      case "info":
        return <MdInfo className="h-4 w-4 text-blue-500" />
      default:
        return <MdCheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MdCheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Music Theory Accuracy Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold ${getScoreColor(metrics.overallScore)}`}>{metrics.overallScore}%</div>
            <div className="text-gray-400">Overall Accuracy Score</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(metrics)
              .filter(([key]) => key !== "overallScore")
              .map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className={getScoreColor(value)}>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues and Recommendations */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Issues & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30">
                {getIssueIcon(issue.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                    <Badge variant={issue.type === "error" ? "destructive" : "secondary"} className="text-xs">
                      {issue.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm">{issue.description}</p>
                  {issue.suggestion && <p className="text-blue-400 text-xs mt-1">💡 {issue.suggestion}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400">Validation Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-2">Music Theory References</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Berklee College of Music Theory Standards</li>
                <li>• Jazz Theory Book (Mark Levine)</li>
                <li>• Harmony and Voice Leading (Edward Aldwell)</li>
                <li>• Guitar Fretboard Workbook (Barrett Tagliarino)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Technical Standards</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Equal Temperament Tuning (A440)</li>
                <li>• Standard Guitar Tuning (E-A-D-G-B-E)</li>
                <li>• Scientific Pitch Notation</li>
                <li>• MIDI Note Number Standards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
