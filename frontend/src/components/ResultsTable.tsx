"use client"

import { useEffect, useState } from "react"
import type { FeedbackItem } from "../types/feedback"
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react"

interface ResultsTableProps {
  feedbackData: FeedbackItem[]
  setFeedbackData: (data: FeedbackItem[]) => void
}

export default function ResultsTable({ feedbackData, setFeedbackData }: ResultsTableProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial data when component mounts
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/feedback")
        if (response.ok) {
          const data = await response.json()
          setFeedbackData(data.feedback)
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setFeedbackData])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-5 w-5 text-green-500" />
      case "negative":
        return <ThumbsDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getSentimentColor = (score: number) => {
    if (score >= 0.5) return "bg-green-100"
    if (score >= 0.05) return "bg-green-50"
    if (score <= -0.5) return "bg-red-100"
    if (score <= -0.05) return "bg-red-50"
    return "bg-gray-50"
  }

  if (loading) {
    return <div className="text-center py-8">Loading feedback data...</div>
  }

  if (feedbackData.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-gray-500">No feedback data available. Upload a CSV or enter feedback manually.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sentiment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comment
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {feedbackData.map((item, index) => (
            <tr key={item.id || index} className={getSentimentColor(item.score)}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getSentimentIcon(item.sentiment)}
                  <span className="ml-2 capitalize">{item.sentiment}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{item.score.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.department || "-"}</td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-md break-words">{item.comment}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
