"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PredictionAccuracyChartProps {
  timeRange: string
}

export function PredictionAccuracyChart({ timeRange }: PredictionAccuracyChartProps) {
  const data = {
    labels: ["Opening Price", "Allotment Chance", "Listing Performance", "Market Sentiment"],
    datasets: [
      {
        label: "Accuracy %",
        data: [87, 92, 78, 85],
        backgroundColor: [
          "rgba(139, 92, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderColor: ["rgb(139, 92, 246)", "rgb(16, 185, 129)", "rgb(251, 191, 36)", "rgb(59, 130, 246)"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(139, 92, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `Accuracy: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) => value + "%",
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Prediction Accuracy</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Performance of AI predictions across different metrics
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={data} options={options} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Overall Accuracy</div>
            <div className="text-lg font-semibold text-purple-600">85.5%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Predictions Made</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">247</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
