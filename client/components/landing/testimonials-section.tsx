"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Senior Investment Analyst",
      avatar: "/professional-indian-man.png",
      rating: 5,
      content:
        "The AI matching system is incredible. I've formed 3 successful partnerships and got allotments in all IPOs I applied for. The transparency is unmatched.",
      trustScore: 98,
      partnerships: 12,
    },
    {
      name: "Priya Sharma",
      role: "Portfolio Manager",
      avatar: "/professional-indian-woman.png",
      rating: 5,
      content:
        "Finally, a platform that understands IPO investments. The predictive analytics helped me make informed decisions and maximize returns.",
      trustScore: 96,
      partnerships: 8,
    },
    {
      name: "Amit Patel",
      role: "Individual Investor",
      avatar: "/professional-indian-businessman.png",
      rating: 5,
      content:
        "As a first-time IPO investor, this platform made everything simple. The partnership formation process is seamless and the community is trustworthy.",
      trustScore: 94,
      partnerships: 5,
    },
    {
      name: "Sneha Reddy",
      role: "Financial Advisor",
      avatar: "/professional-indian-financial-advisor.jpg",
      rating: 5,
      content:
        "The real-time tracking and transparency features give me complete confidence. I recommend this platform to all my clients interested in IPOs.",
      trustScore: 99,
      partnerships: 15,
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
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Trusted by Investors</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See what our community of successful investors has to say about their experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                {/* Rating stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial content */}
                <blockquote className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* User info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>

                  {/* Trust metrics */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Trust Score: {testimonial.trustScore}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.partnerships} partnerships
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust metrics summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">4.9/5</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">96.8%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Average Trust Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">2,847</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Happy Investors</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
