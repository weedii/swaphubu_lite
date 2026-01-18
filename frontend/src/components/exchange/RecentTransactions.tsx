"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated";
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const recentTransactions = [
  {
    id: "TXN001",
    type: "buy",
    fromCurrency: "USD",
    toCurrency: "BTC",
    fromAmount: "1,500.00",
    toAmount: "0.035",
    status: "completed",
    timestamp: "2 minutes ago",
  },
  {
    id: "TXN002",
    type: "sell",
    fromCurrency: "ETH",
    toCurrency: "USD",
    fromAmount: "2.5",
    toAmount: "6,450.00",
    status: "processing",
    timestamp: "5 minutes ago",
  },
  {
    id: "TXN003",
    type: "buy",
    fromCurrency: "EUR",
    toCurrency: "ADA",
    fromAmount: "500.00",
    toAmount: "1,030.93",
    status: "completed",
    timestamp: "12 minutes ago",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="text-green-600 bg-green-50">
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="secondary" className="text-red-600 bg-red-50">
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function RecentTransactions() {
  return (
    <AnimatedCard>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Recent Transactions</CardTitle>
            </div>
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Your latest exchange activities
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Transaction Type Icon */}
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "buy"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {transaction.type === "buy" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {transaction.type === "buy" ? "Buy" : "Sell"}{" "}
                        {transaction.toCurrency}
                      </span>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.fromAmount} {transaction.fromCurrency} →{" "}
                      {transaction.toAmount} {transaction.toCurrency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.timestamp}
                    </div>
                  </div>
                </div>

                {/* Status and Amount */}
                <div className="text-right space-y-2">
                  {getStatusBadge(transaction.status)}
                  <div className="text-sm font-medium">
                    {transaction.type === "buy" ? "-" : "+"}
                    {transaction.fromAmount} {transaction.fromCurrency}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-6 text-center">
            <Link href="/transactions">
              <Button variant="ghost" className="w-full">
                View All Transactions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Empty State Message */}
          {recentTransactions.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">
                No transactions yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first exchange to see your transaction history here
              </p>
              <Button>Start Exchange</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
