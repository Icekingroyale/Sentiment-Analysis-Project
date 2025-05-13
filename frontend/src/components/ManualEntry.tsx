"use client"

import type React from "react"

import { useState } from "react"
import type { FeedbackItem } from "../types/feedback"
import { AlertCircle } from "lucide-react"

interface ManualEntryProps {
  onSubmitSuccess: (data: FeedbackItem) => void
}

export default function ManualEntry({ onSubmitSuccess }: ManualEntryProps) {
  const [comment, setComment] = useState("")
  const [department, setDepartment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) {
      setError("Please enter a comment")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
          department: department.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze comment")
      }

      const data = await response.json()
      onSubmitSuccess(data)

      // Reset form
      setComment("")
      setDepartment("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="department" className="block text-sm font-medium">
            Department (Optional)
          </label>
          <input
            id="department"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g., Computer Science, Mathematics"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium">
            Student Feedback
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter student feedback here..."
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {error && (
          <div className="flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !comment.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Feedback"}
        </button>
      </form>
    </div>
  )
}
