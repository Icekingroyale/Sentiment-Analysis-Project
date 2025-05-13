export interface FeedbackItem {
  id?: number
  comment: string
  department?: string
  sentiment: "positive" | "negative" | "neutral"
  score: number
  timestamp?: string
}
