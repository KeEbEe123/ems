import { Card } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", value: 20000 },
  { name: "Feb", value: 19500 },
  { name: "Mar", value: 19000 },
  { name: "Apr", value: 18500 },
  { name: "May", value: 18000 },
  { name: "Jun", value: 17500 },
]

export function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white p-6">
          <div className="mb-4">
            <h3 className="text-sm text-gray-600 mb-1">Total Sales</h3>
            <p className="text-2xl font-semibold">20000</p>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white p-6">
          <div className="mb-4">
            <h3 className="text-sm text-gray-600 mb-1">Total Sales</h3>
            <p className="text-2xl font-semibold">20000</p>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
