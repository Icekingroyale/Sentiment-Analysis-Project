"use client"

import { useState, useEffect } from "react"
import UploadCSV from "../components/UploadCSV"
import ManualEntry from "../components/ManualEntry"
import ResultsTable from "../components/ResultsTable"
import SentimentCharts from "../components/SentimentCharts"
import type { FeedbackItem } from "../types/feedback"

export default function Home() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([])
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload")
  const [loading, setLoading] = useState(false)

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/feedback")
        if (response.ok) {
          const data = await response.json()
          setFeedbackData(data.feedback)
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error)
      }
    }

    fetchData()
  }, [])

  const handleNewFeedback = (newData: FeedbackItem | FeedbackItem[]) => {
    if (Array.isArray(newData)) {
      setFeedbackData((prev) => [...newData, ...prev])
    } else {
      setFeedbackData((prev) => [newData, ...prev])
    }
  }

  const handleExportCSV = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/export-csv")
      const data = await response.json()

      // Create a blob and download link
      const blob = new Blob([data.csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.setAttribute("hidden", "")
      a.setAttribute("href", url)
      a.setAttribute("download", "feedback_export.csv")
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting CSV:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Educational Institution Feedback Analysis</h1>
        <p className="text-gray-600">Collect and analyze student feedback with sentiment analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="mb-4">
            <div className="flex border-b">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "upload"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                Upload CSV
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "manual"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("manual")}
              >
                Manual Entry
              </button>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            {activeTab === "upload" ? (
              <UploadCSV onUploadSuccess={handleNewFeedback} />
            ) : (
              <ManualEntry onSubmitSuccess={handleNewFeedback} />
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Exporting..." : "Export All Feedback as CSV"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Sentiment Analysis Results</h2>
            <SentimentCharts feedbackData={feedbackData} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Feedback Results</h2>
            <ResultsTable feedbackData={feedbackData} setFeedbackData={setFeedbackData} />
          </div>
        </div>
      </div>
    </main>
  )
}
