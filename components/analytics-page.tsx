"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";

const salesData = [
  { name: "Jan", value: 20000 },
  { name: "Feb", value: 19500 },
  { name: "Mar", value: 19000 },
  { name: "Apr", value: 18500 },
  { name: "May", value: 18000 },
  { name: "Jun", value: 17500 },
];

const recentTransactions = [
  {
    id: "1",
    name: "Bhavya Vis...",
    email: "se92ucom004@mahin...",
    registeredAt: "Nov 27, 2024 04:15 PM IST",
    amount: "₹0",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Bhavya Vis...",
    email: "se92ucom004@mahin...",
    registeredAt: "Nov 27, 2024 04:15 PM IST",
    amount: "₹0",
    status: "CANCELLED",
  },
];

const ticketStatus = [
  { name: "Individual Pass", sold: 50, total: 300, percentage: 10 },
  { name: "Team Pass (4-5 members)", sold: 175, total: 500, percentage: 35 },
  { name: "Accommodation Pass", sold: 30, total: 300, percentage: 10 },
  {
    name: "[Help Desk] Team pass (4-5 members) Pass",
    sold: 30,
    total: 300,
    percentage: 10,
  },
  { name: "E - Call Pass", sold: 0, total: 500, percentage: 0 },
  { name: "Day 2 Pass", sold: 0, total: 500, percentage: 0 },
];

export function AnalyticsPage() {
  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - Analytics
        </h1>
      </div>

      {/* Event Transaction Section */}
      <Card className="bg-neutral-900 border-neutral-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Event Transaction
          </CardTitle>
          <p className="text-neutral-400 text-sm">
            Here is the trend of tickets sold and amount collected
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-1">
              <Card className="bg-white p-4">
                <div className="mb-4">
                  <h3 className="text-sm text-gray-600 mb-1">Total Sales</h3>
                  <p className="text-2xl font-semibold">20000</p>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Metrics Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">
                  Today's Registration
                </h3>
                <p className="text-2xl font-semibold">0</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">
                  Total Registrations
                </h3>
                <p className="text-2xl font-semibold">285</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">Today's Sale</h3>
                <p className="text-2xl font-semibold">₹0</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">Total Sale</h3>
                <p className="text-2xl font-semibold">₹45,000</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">Today's Refunds</h3>
                <p className="text-2xl font-semibold">₹0</p>
              </Card>
              <Card className="bg-white p-4">
                <h3 className="text-sm text-gray-600 mb-1">Total Refunds</h3>
                <p className="text-2xl font-semibold">₹2,500</p>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 text-sm text-neutral-400 pb-2 border-b border-neutral-700">
                <span>Name</span>
                <span>Email</span>
                <span>Registered at</span>
                <span>Amount</span>
                <span>Ticket Status</span>
              </div>

              {/* Table Rows */}
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-5 gap-4 text-sm text-white py-2"
                >
                  <span>{transaction.name}</span>
                  <span className="text-neutral-400">{transaction.email}</span>
                  <span className="text-neutral-400">
                    {transaction.registeredAt}
                  </span>
                  <span>{transaction.amount}</span>
                  <Badge
                    className={
                      transaction.status === "ACTIVE"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Status */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Tickets Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketStatus.map((ticket, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">
                      {ticket.name}({ticket.sold}/{ticket.total})
                    </span>
                    <span className="text-purple-400 text-sm font-medium">
                      {ticket.percentage}%
                    </span>
                  </div>
                  <Progress
                    value={ticket.percentage}
                    className="h-2 bg-neutral-700"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
