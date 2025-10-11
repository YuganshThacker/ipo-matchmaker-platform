"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export function SectorAllocationChart() {
  const data = {
    labels: ["Technology", "Healthcare", "Financial Services", "Renewable Energy", "Others"],
    datasets: [
      {
        data: [35, 24, 20, 13, 8],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(139, 92, 246)",
          "rgb(251, 191, 36)",
          "rgb(156, 163, 175)",
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
    cutout: "60%",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Allocation</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">Portfolio distribution across sectors</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
