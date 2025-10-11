"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { UserPlus, Search, Handshake, TrendingUp } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Profile",
      description: "Sign up and complete your KYC verification with investment preferences and risk profile.",
      details: ["Quick KYC process", "Investment preferences", "Risk assessment"],
    },
    {
      icon: Search,
      title: "Discover IPOs",
      description: "Browse upcoming IPOs with AI-powered insights, predictions, and detailed analysis.",
      details: ["AI predictions", "Market analysis", "Risk assessment"],
    },
    {
      icon: Handshake,
      title: "Form Partnerships",
      description: "Get matched with compatible investors and form strategic partnerships instantly.",
      details: ["Smart matching", "Instant partnerships", "Secure agreements"],
    },
    {
      icon: TrendingUp,
      title: "Track Success",
      description: "Monitor your investments, track performance, and celebrate successful allotments.",
      details: ["Real-time tracking", "Performance metrics", "Success analytics"],
    },
  ]

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">How It Works</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get started with IPO partnerships in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-emerald-300 dark:from-blue-600 dark:to-emerald-600 z-0" />
              )}

              <Card className="p-6 text-center relative z-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 p-4 relative">
                  <step.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>

                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">{step.description}</p>

                <ul className="space-y-1">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 mr-2" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Timeline visualization for mobile */}
        <div className="lg:hidden mt-12">
          <div className="flex flex-col items-center space-y-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-emerald-300 dark:from-blue-600 dark:to-emerald-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
