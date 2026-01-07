"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ExchangeWidget } from "@/components/exchange/ExchangeWidget";
import { MarketOverview } from "@/components/exchange/MarketOverview";
import { RecentTransactions } from "@/components/exchange/RecentTransactions";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { FadeIn, SlideUp } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Globe } from "lucide-react";

export default function ExchangePage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <FadeIn>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live Exchange Rates
              </Badge>
              <h1 className="text-4xl font-bold mb-4">Crypto Exchange</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Exchange cryptocurrencies instantly with the best rates, secure
                transactions, and 24/7 support.
              </p>
            </div>
          </FadeIn>

          {/* Trust Indicators */}
          <SlideUp delay={0.2}>
            <div className="flex justify-center items-center gap-8 mb-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Instant Exchange</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Global Access</span>
              </div>
            </div>
          </SlideUp>

          {/* Main Exchange Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Exchange Widget - Takes up 2 columns on large screens */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <ExchangeWidget />
              </AnimatedSection>
            </div>

            {/* Market Overview - Takes up 1 column */}
            <div className="lg:col-span-1">
              <AnimatedSection>
                <MarketOverview />
              </AnimatedSection>
            </div>
          </div>

          {/* Recent Transactions */}
          <AnimatedSection>
            <RecentTransactions />
          </AnimatedSection>
        </div>
      </div>
    </MainLayout>
  );
}
