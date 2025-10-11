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
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface PortfolioPerformanceChartProps {
  timeRange: string
}

export function PortfolioPerformanceChart({ timeRange }: PortfolioPerformanceChartProps) {
  // Mock data based on time range
  const generateData = (range: string) => {
    const baseData = {
      "1m": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        portfolio: [100000, 102500, 105200, 108300],
        benchmark: [100000, 101200, 102800, 104500],
      },
      "3m": {
        labels: ["Month 1", "Month 2", "Month 3"],
        portfolio: [100000, 108300, 118500],
        benchmark: [100000, 104500, 109200],
      },
      "6m": {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        portfolio: [100000, 105200, 112800, 118300, 124700, 132400],
        benchmark: [100000, 102800, 106500, 109200, 112800, 116500],
      },
      "1y": {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        portfolio: [100000, 118300, 132400, 148900],
        benchmark: [100000, 109200, 116500, 125300],
      },
      all: {
        labels: ["2022", "2023", "2024", "2025"],
        portfolio: [100000, 125300, 148900, 178200],
        benchmark: [100000, 115200, 125300, 138700],
      },
    }
    return baseData[range as keyof typeof baseData] || baseData["6m"]
  }

  const data = generateData(timeRange)

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Your Portfolio",
        data: data.portfolio,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "Market Benchmark",
        data: data.benchmark,
        borderColor: "rgb(156, 163, 175)",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(156, 163, 175)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5],
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            const formatted = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
            return `${context.dataset.label}: ${formatted}`
          },
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
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: any) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value),
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  const currentValue = data.portfolio[data.portfolio.length - 1]
  const initialValue = data.portfolio[0]
  const totalReturn = (((currentValue - initialValue) / initialValue) * 100).toFixed(1)
  const benchmarkReturn = (
    ((data.benchmark[data.benchmark.length - 1] - data.benchmark[0]) / data.benchmark[0]) *
    100
  ).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Performance</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-emerald-600 font-semibold">
              +{totalReturn}% vs +{benchmarkReturn}% benchmark
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Current Value</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">₹{currentValue.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Return</div>
            <div className="text-lg font-semibold text-emerald-600">
              +₹{(currentValue - initialValue).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">Return %</div>
            <div className="text-lg font-semibold text-emerald-600">+{totalReturn}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
