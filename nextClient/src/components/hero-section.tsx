"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Bot, TrendingUp } from "lucide-react"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  features?: string[]
}

export default function HeroSection({
  title = "AI-Powered Blog Platform",
  subtitle = "Automated Content Generation & SEO Optimization",
  description = "Transform your content strategy with our intelligent blog platform. Generate SEO-optimized articles, analyze performance, and engage your audience with AI-driven insights.",
  ctaText = "Explore Articles",
  ctaLink = "/blog",
  features = [
    "AI Content Generation",
    "SEO Optimization",
    "Analytics Dashboard",
    "Automated Publishing"
  ]
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
          
          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/admin">
                Admin Dashboard
              </Link>
            </Button>
          </div>
          
          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const icons = [Sparkles, Bot, TrendingUp, ArrowRight]
              const Icon = icons[index] || Sparkles
              
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature}
                  </h3>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-50 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-50 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full opacity-50 animate-pulse delay-500" />
    </section>
  )
}