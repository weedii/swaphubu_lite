"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/ui/animated";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
} from "lucide-react";

const marketData = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$42,650.00",
    change: "+2.45%",
    changeValue: "+$1,020.50",
    isPositive: true,
    volume: "$28.5B",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$2,580.00",
    change: "+1.82%",
    changeValue: "+$46.20",
    isPositive: true,
    volume: "$12.8B",
  },
  {
    symbol: "BNB",
    name: "Binance Coin",
    price: "$315.40",
    change: "-0.95%",
    changeValue: "-$3.02",
    isPositive: false,
    volume: "$1.2B",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: "$0.485",
    change: "+3.21%",
    changeValue: "+$0.015",
    isPositive: true,
    volume: "$890M",
  },
  {
    symbol: "USDT",
    name: "Tether",
    price: "$1.000",
    change: "+0.01%",
    changeValue: "+$0.0001",
    isPositive: true,
    volume: "$45.2B",
  },
];

export function MarketOverview() {
  return (
    <div className="space-y-6">
      {/* Market Stats Card */}
      <AnimatedCard>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Market Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$1.8T</div>
                <div className="text-xs text-muted-foreground">Market Cap</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">$89.2B</div>
                <div className="text-xs text-muted-foreground">24h Volume</div>
              </div>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">+2.8%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Market Trend (24h)
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Top Cryptocurrencies */}
      <AnimatedCard>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Top Cryptocurrencies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {marketData.map((crypto, index) => (
              <div
                key={crypto.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {crypto.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{crypto.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {crypto.name}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-sm">{crypto.price}</div>
                  <div className="flex items-center gap-1">
                    {crypto.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        crypto.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {crypto.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Quick Actions */}
      <AnimatedCard>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <button className="p-3 text-left rounded-lg hover:bg-muted/30 transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium text-sm">Buy Bitcoin</div>
                <div className="text-xs text-muted-foreground">
                  Start with as little as $10
                </div>
              </button>
              <button className="p-3 text-left rounded-lg hover:bg-muted/30 transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium text-sm">Sell Ethereum</div>
                <div className="text-xs text-muted-foreground">
                  Convert to fiat instantly
                </div>
              </button>
              <button className="p-3 text-left rounded-lg hover:bg-muted/30 transition-colors border border-dashed border-muted-foreground/20">
                <div className="font-medium text-sm">View Portfolio</div>
                <div className="text-xs text-muted-foreground">
                  Track your investments
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  );
}
