"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  ArrowUpDown,
  TrendingUp,
  Clock,
  Shield,
  RefreshCw,
  Calculator,
} from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", type: "fiat" },
  { code: "EUR", name: "Euro", symbol: "€", type: "fiat" },
  { code: "GBP", name: "British Pound", symbol: "£", type: "fiat" },
  { code: "BTC", name: "Bitcoin", symbol: "₿", type: "crypto" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ", type: "crypto" },
  { code: "USDT", name: "Tether", symbol: "₮", type: "crypto" },
  { code: "BNB", name: "Binance Coin", symbol: "BNB", type: "crypto" },
  { code: "ADA", name: "Cardano", symbol: "₳", type: "crypto" },
];

export function ExchangeWidget() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("1000");
  const [toAmount, setToAmount] = useState("0.023456");
  const [isLoading, setIsLoading] = useState(false);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleRefreshRates = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const fromCurrencyData = currencies.find((c) => c.code === fromCurrency);
  const toCurrencyData = currencies.find((c) => c.code === toCurrency);

  return (
    <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Exchange Calculator</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshRates}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Get real-time exchange rates and instant conversions
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* From Currency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">You Send</label>
            <Badge variant="outline" className="text-xs">
              {fromCurrencyData?.type === "fiat" ? "Fiat" : "Crypto"}
            </Badge>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Enter amount"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 text-lg font-medium"
              type="number"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {currency.symbol}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapCurrencies}
            className="rounded-full bg-primary/10 hover:bg-primary/20 border-primary/20"
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">You Receive</label>
            <Badge variant="outline" className="text-xs">
              {toCurrencyData?.type === "fiat" ? "Fiat" : "Crypto"}
            </Badge>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Calculated amount"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="flex-1 text-lg font-medium bg-muted/50"
              type="number"
              readOnly
            />
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-xs text-muted-foreground">
                        {currency.symbol}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Exchange Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="font-medium">
                1 {fromCurrency} = 0.000023 {toCurrency}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Processing Time</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>~2-5 minutes</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
        </div>

        <Separator />

        {/* Exchange Button */}
        <Button className="w-full" size="lg" disabled={isLoading}>
          <Shield className="h-4 w-4 mr-2" />
          {isLoading ? "Processing..." : "Start Exchange"}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-center text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Shield className="h-3 w-3 inline mr-1" />
          Your transaction is secured with bank-level encryption and
          multi-signature technology
        </div>
      </CardContent>
    </Card>
  );
}
