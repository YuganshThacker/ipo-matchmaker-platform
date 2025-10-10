"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface PartnershipAnalyticsChartProps {
  timeRange: string
}

export function PartnershipAnalyticsChart({ timeRange }: PartnershipAnalyticsChartProps) {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Partnerships",
        data: [2, 3, 1, 4, 2, 3],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: "Success Rate %",
        data: [85, 90, 95, 88, 92, 94],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 6,
        yAxisID: "y1",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
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
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "New Partnerships",
          font: {
            size: 12,
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) => value + "%",
        },
        title: {
          display: true,
          text: "Success Rate (%)",
          font: {
            size: 12,
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partnership Analytics</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">Partnership formation trends and success rates</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={data} options={options} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Partnerships</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">15</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Active</div>
            <div className="text-lg font-semibold text-blue-600">12</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Avg Success Rate</div>
            <div className="text-lg font-semibold text-emerald-600">90.7%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
