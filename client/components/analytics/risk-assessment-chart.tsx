"use client"

import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { Radar } from "react-chartjs-2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface RiskAssessmentChartProps {
  data?: {
    marketRisk: number
    liquidityRisk: number
    creditRisk: number
    operationalRisk: number
    regulatoryRisk: number
    concentrationRisk: number
  }
}

export function RiskAssessmentChart({ data }: RiskAssessmentChartProps) {
  const defaultData = {
    marketRisk: 65,
    liquidityRisk: 45,
    creditRisk: 30,
    operationalRisk: 55,
    regulatoryRisk: 40,
    concentrationRisk: 70,
  }

  const riskData = data || defaultData

  const chartData = {
    labels: [
      "Market Risk",
      "Liquidity Risk",
      "Credit Risk",
      "Operational Risk",
      "Regulatory Risk",
      "Concentration Risk",
    ],
    datasets: [
      {
        label: "Current Risk Level",
        data: Object.values(riskData),
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(239, 68, 68, 1)",
      },
      {
        label: "Risk Tolerance",
        data: [80, 70, 60, 75, 65, 85],
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(34, 197, 94, 1)",
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
          color: "hsl(var(--foreground))",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--background))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.r}%`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "hsl(var(--muted-foreground))",
          font: {
            size: 10,
          },
        },
        grid: {
          color: "hsl(var(--border))",
        },
        angleLines: {
          color: "hsl(var(--border))",
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Portfolio risk analysis across different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Radar data={chartData} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overall Risk Score:</span>
              <span className="font-medium text-orange-600">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Highest Risk:</span>
              <span className="font-medium text-red-600">Concentration</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Risk Trend:</span>
              <span className="font-medium text-green-600">Improving</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">2 hours ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
