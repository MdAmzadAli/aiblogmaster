"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsData {
  name: string
  value: number
  color?: string
}

interface AnalyticsChartProps {
  data: AnalyticsData[]
  title?: string
  className?: string
}

export default function AnalyticsChart({ 
  data, 
  title = "Analytics",
  className 
}: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      item.color || 'bg-blue-600 dark:bg-blue-500'
                    }`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right font-medium">
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
          
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No analytics data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}