"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface IPOSubscriptionChartProps {
  timeRange: string
}

export function IPOSubscriptionChart({ timeRange }: IPOSubscriptionChartProps) {
  const data = {
    labels: ["TechCorp", "GreenEnergy", "FinTech", "HealthTech", "EduTech", "LogiTech"],
    datasets: [
      {
        label: "Subscription Ratio",
        data: [2.4, 8.7, 5.2, 3.8, 1.9, 6.3],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(245, 101, 101, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(139, 92, 246)",
          "rgb(245, 101, 101)",
          "rgb(251, 191, 36)",
          "rgb(156, 163, 175)",
        ],
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
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `Subscription: ${context.parsed.y}x`,
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
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) => value + "x",
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IPO Subscription Analysis</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">Subscription ratios for recent IPO applications</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={data} options={options} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Avg Subscription</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">4.7x</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Highest</div>
            <div className="text-lg font-semibold text-emerald-600">8.7x</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Success Rate</div>
            <div className="text-lg font-semibold text-blue-600">83%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
