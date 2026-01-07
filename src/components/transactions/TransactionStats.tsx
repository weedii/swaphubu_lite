"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";

export function TransactionStats() {
  const stats = [
    {
      title: "Total Volume",
      value: "$45,230.50",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      description: "Last 30 days",
    },
    {
      title: "Total Transactions",
      value: "127",
      change: "+8",
      changeType: "positive",
      icon: ArrowUpDown,
      description: "This month",
    },
    {
      title: "Average Trade",
      value: "$356.15",
      change: "-2.1%",
      changeType: "negative",
      icon: Activity,
      description: "Per transaction",
    },
    {
      title: "Active Days",
      value: "18",
      change: "+3",
      changeType: "positive",
      icon: Calendar,
      description: "This month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <div
                  className={`flex items-center gap-1 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="font-medium">{stat.change}</span>
                </div>
                <span className="ml-2">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
