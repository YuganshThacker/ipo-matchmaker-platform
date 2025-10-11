"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Shield, TrendingUp, Users, Zap, BarChart3, ArrowRight } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description:
        "Our machine learning algorithms analyze investment patterns, risk profiles, and preferences to find your perfect partnership matches.",
      benefits: ["95% compatibility rate", "Real-time matching", "Smart recommendations"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Complete Transparency",
      description:
        "Track every rupee, see real-time fund flows, and access detailed partnership audit trails with full transparency.",
      benefits: ["Real-time tracking", "Audit trails", "Fund flow visibility"],
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description:
        "Get AI-powered predictions for IPO opening prices, allotment chances, and market performance insights.",
      benefits: ["Price predictions", "Allotment probability", "Market insights"],
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Verified Network",
      description: "Connect with KYC-verified investors in our trusted community with comprehensive background checks.",
      benefits: ["KYC verified users", "Trust scoring", "Background checks"],
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Zap,
      title: "Instant Partnerships",
      description: "Form partnerships in minutes with our streamlined process and automated documentation.",
      benefits: ["Quick setup", "Auto documentation", "Instant matching"],
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Access comprehensive dashboards with portfolio insights, performance metrics, and market analysis.",
      benefits: ["Portfolio insights", "Performance tracking", "Market analysis"],
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 text-balance">
            Everything You Need for
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {" "}
              Smart Investing
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto text-pretty">
            Our comprehensive platform combines cutting-edge technology with financial expertise to maximize your IPO
            investment success.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                <div
                  className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${feature.color} p-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>

                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{feature.description}</p>

                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-emerald-600 border-0 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your IPO Journey?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of successful investors who trust our platform for their IPO partnerships.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
