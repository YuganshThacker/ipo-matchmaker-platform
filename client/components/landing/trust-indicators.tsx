"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, Award, Users, Shield } from "lucide-react"

export function TrustIndicators() {
  const stats = [
    {
      icon: TrendingUp,
      value: "94.2%",
      label: "Success Rate",
      description: "Average partnership success rate",
      color: "text-emerald-500",
    },
    {
      icon: Award,
      value: "₹2.4Cr",
      label: "Total Invested",
      description: "Through our platform",
      color: "text-blue-500",
    },
    {
      icon: Users,
      value: "15,000+",
      label: "Active Users",
      description: "Verified investors",
      color: "text-purple-500",
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure",
      description: "KYC verified partnerships",
      color: "text-orange-500",
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
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Trusted by Thousands of Investors
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our platform has facilitated successful IPO partnerships with industry-leading security and transparency.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-slate-700 p-3 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{stat.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{stat.description}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16 opacity-60"
        >
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">SECURED BY</div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SEBI Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">KYC Verified</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
