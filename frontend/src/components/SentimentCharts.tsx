"use client"

import { useMemo } from "react"
import type { FeedbackItem } from "../types/feedback"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface SentimentChartsProps {
  feedbackData: FeedbackItem[]
}

export default function SentimentCharts({ feedbackData }: SentimentChartsProps) {
  // Prepare data for sentiment distribution pie chart
  const sentimentData = useMemo(() => {
    const counts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    }

    feedbackData.forEach((item) => {
      counts[item.sentiment as keyof typeof counts]++
    })

    return [
      { name: "Positive", value: counts.positive, color: "#22c55e" },
      { name: "Negative", value: counts.negative, color: "#ef4444" },
      { name: "Neutral", value: counts.neutral, color: "#9ca3af" },
    ]
  }, [feedbackData])

  // Prepare data for department bar chart
  const departmentData = useMemo(() => {
    if (feedbackData.length === 0) return []

    const departments: Record<string, { positive: number; negative: number; neutral: number }> = {}

    // Count sentiments by department
    feedbackData.forEach((item) => {
      const dept = item.department || "Unknown"
      if (!departments[dept]) {
        departments[dept] = { positive: 0, negative: 0, neutral: 0 }
      }
      departments[dept][item.sentiment as keyof (typeof departments)[typeof dept]]++
    })

    // Convert to array format for chart
    return Object.entries(departments).map(([name, counts]) => ({
      name,
      ...counts,
    }))
  }, [feedbackData])

  if (feedbackData.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-gray-500">No data available for charts. Upload a CSV or enter feedback manually.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Distribution Pie Chart */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Sentiment Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} comments`, "Count"]}
                contentStyle={{ borderRadius: "0.375rem" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Sentiment Bar Chart */}
      {departmentData.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Sentiment by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#22c55e" name="Positive" />
                <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                <Bar dataKey="neutral" fill="#9ca3af" name="Neutral" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
