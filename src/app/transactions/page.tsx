"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionStats } from "@/components/transactions/TransactionStats";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { FadeIn, SlideUp } from "@/components/ui/animated";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, ArrowUpDown } from "lucide-react";

export default function TransactionsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <FadeIn>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <History className="h-3 w-3 mr-1" />
                Transaction History
              </Badge>
              <h1 className="text-4xl font-bold mb-4">My Transactions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Track all your cryptocurrency exchanges, view transaction
                details, and monitor your trading activity.
              </p>
            </div>
          </FadeIn>

          {/* Transaction Stats */}
          <SlideUp delay={0.2}>
            <div className="mb-8">
              <TransactionStats />
            </div>
          </SlideUp>

          {/* Filters and List */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <AnimatedSection>
                <TransactionFilters />
              </AnimatedSection>
            </div>

            {/* Transactions List */}
            <div className="lg:col-span-3">
              <AnimatedSection>
                <TransactionsList />
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
