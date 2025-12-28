"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, AlertCircle, PieChart } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardStats {
  totalProperties: number
  activeProperties: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  maintenanceUnits: number
  occupancyRate: number
  rentCollectedThisMonth: number
  outstandingBalance: number
  delayedPayments: number
  incomeExpenseData: Array<{ month: string; income: number; expense: number }>
  revenueTrendData: Array<{ month: string; collected: number; outstanding: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          cache: "no-store",
        })
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("[v0] Failed to fetch dashboard stats:", error)
        setStats({
          totalProperties: 0,
          activeProperties: 0,
          totalUnits: 0,
          occupiedUnits: 0,
          vacantUnits: 0,
          maintenanceUnits: 0,
          occupancyRate: 0,
          rentCollectedThisMonth: 0,
          outstandingBalance: 0,
          delayedPayments: 0,
          incomeExpenseData: [],
          revenueTrendData: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    )
  }

  const occupancyData = [
    { name: "Occupied", value: stats.occupiedUnits, fill: "#22c55e" },
    { name: "Vacant", value: stats.vacantUnits, fill: "#ef4444" },
    { name: "Maintenance", value: stats.maintenanceUnits, fill: "#f59e0b" },
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Property management overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">{stats.activeProperties} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.occupiedUnits} of {stats.totalUnits} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rent Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {Math.round(stats.rentCollectedThisMonth).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              UGX {Math.round(stats.outstandingBalance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{stats.delayedPayments} delayed payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Rent collected vs outstanding over 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                collected: { label: "Collected", color: "#22c55e" },
                outstanding: { label: "Outstanding", color: "#ef4444" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="collected" stroke="#22c55e" name="Collected" />
                  <Line type="monotone" dataKey="outstanding" stroke="#ef4444" name="Outstanding" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unit Status</CardTitle>
            <CardDescription>Occupancy distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                occupied: { label: "Occupied", color: "#22c55e" },
                vacant: { label: "Vacant", color: "#ef4444" },
                maintenance: { label: "Maintenance", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPie>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly revenue and expenses comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: { label: "Income", color: "#3b82f6" },
                expense: { label: "Expenses", color: "#f59e0b" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="income" fill="#3b82f6" name="Income" />
                  <Bar dataKey="expense" fill="#f59e0b" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
