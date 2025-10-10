"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [liveApplications, setLiveApplications] = useState(1247)
  const [successfulPartnerships, setSuccessfulPartnerships] = useState(892)

  // Animate counters
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveApplications((prev) => prev + Math.floor(Math.random() * 3))
      if (Math.random() > 0.7) {
        setSuccessfulPartnerships((prev) => prev + 1)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const floatingCards = [
    {
      icon: TrendingUp,
      title: "Smart Matching",
      description: "AI-powered partnership recommendations",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Verified Partners",
      description: "KYC verified investor network",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-grade security & transparency",
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <section className="relative min-h-screen pt-24 md:pt-28 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-balance">
              Smart IPO
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                Partnerships
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 text-pretty max-w-3xl mx-auto">
              Connect with verified investors through our AI-powered matchmaking platform. Maximize your IPO allocation
              chances with strategic partnerships.
            </p>
          </motion.div>

          {/* Live counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <div className="glass rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-bold text-emerald-400 animate-pulse-success">
                {liveApplications.toLocaleString()}
              </div>
              <div className="text-sm text-slate-300">Live IPO Applications</div>
            </div>
            <div className="glass rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl font-bold text-blue-400 animate-pulse-success">
                {successfulPartnerships.toLocaleString()}
              </div>
              <div className="text-sm text-slate-300">Successful Partnerships</div>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg rounded-xl"
            >
              <Link href="/register">
                Start Matching
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg rounded-xl bg-transparent"
            >
              <Link href="/how-it-works">Learn More</Link>
            </Button>
          </motion.div>

          {/* Floating feature cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {floatingCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group"
              >
                <Card className="glass p-6 text-center hover:shadow-2xl transition-all duration-300 border-slate-700">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${card.color} p-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-slate-400 text-sm">{card.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
