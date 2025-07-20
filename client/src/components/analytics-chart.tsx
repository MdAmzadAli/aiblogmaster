import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Eye, Users } from "lucide-react";

// Chart.js types and imports
declare global {
  interface Window {
    Chart: any;
  }
}

export default function AnalyticsChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const { data: analytics, isLoading } = useQuery<{
    totalViews?: number;
  }>({
    queryKey: ["/api/admin/analytics/summary"],
  });

  useEffect(() => {
    // Load Chart.js from CDN if not already loaded
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        initializeChart();
      };
      document.head.appendChild(script);
    } else {
      initializeChart();
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [analytics]);

  const initializeChart = () => {
    if (!chartRef.current || !window.Chart) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Sample data - in a real app this would come from the analytics API
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Page Views',
        data: [12000, 15000, 18000, 22000, 25000, 28000],
        borderColor: 'hsl(207, 90%, 54%)',
        backgroundColor: 'hsla(207, 90%, 54%, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'hsl(207, 90%, 54%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'hsl(240, 10%, 3.9%)',
            titleColor: 'hsl(0, 0%, 98%)',
            bodyColor: 'hsl(0, 0%, 98%)',
            borderColor: 'hsl(240, 3.7%, 15.9%)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function(context: any) {
                return `${context[0].label} 2024`;
              },
              label: function(context: any) {
                return `${context.parsed.y.toLocaleString()} views`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(20, 5.9%, 90%)',
              drawBorder: false,
            },
            ticks: {
              color: 'hsl(25, 5.3%, 44.7%)',
              font: {
                size: 12
              },
              callback: function(value: any) {
                return (value / 1000) + 'K';
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'hsl(25, 5.3%, 44.7%)',
              font: {
                size: 12
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
        elements: {
          point: {
            hoverBackgroundColor: 'hsl(207, 90%, 54%)',
          }
        }
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Content Performance</CardTitle>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Content Performance
        </CardTitle>
        <Select defaultValue="30">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="chart-container">
            <canvas ref={chartRef} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-2xl font-bold text-blue-600">
                {analytics?.totalViews?.toLocaleString() || '0'}
              </p>
            </div>
            <p className="text-sm text-gray-600">Page Views</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-emerald-600 mr-2" />
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round((analytics?.totalViews || 0) * 0.65).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-600">Unique Visitors</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <p className="text-2xl font-bold text-purple-600">4:32</p>
            </div>
            <p className="text-sm text-gray-600">Avg. Read Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
