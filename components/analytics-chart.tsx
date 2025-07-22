"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsData {
  name: string
  value: number
}

interface AnalyticsChartProps {
  data: AnalyticsData[]
  title?: string
}

export default function AnalyticsChart({ data, title = "Analytics" }: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium">{item.name}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}