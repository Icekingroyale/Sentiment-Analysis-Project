"use client"

import type React from "react"

import { useState } from "react"
import type { FeedbackItem } from "../types/feedback"
import { Upload, FileText, AlertCircle } from "lucide-react"

interface UploadCSVProps {
  onUploadSuccess: (data: FeedbackItem[]) => void
}

export default function UploadCSV({ onUploadSuccess }: UploadCSVProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a CSV file")
      return
    }

    // Check if file is CSV
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://localhost:5000/api/analyze-csv", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload CSV")
      }

      const data = await response.json()
      onUploadSuccess(data.results)
      setFile(null)

      // Reset the file input
      const fileInput = document.getElementById("csv-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
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
          <label htmlFor="csv-file" className="block text-sm font-medium">
            Upload CSV File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            <label htmlFor="csv-file" className="cursor-pointer flex flex-col items-center justify-center">
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Click to select a CSV file</span>
                  <span className="text-xs text-gray-500">
                    CSV should have a 'comment' column and optional 'department' column
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {error && (
          <div className="flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Feedback"}
        </button>
      </form>
    </div>
  )
}
