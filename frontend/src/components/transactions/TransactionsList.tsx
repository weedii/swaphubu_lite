"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Eye,
} from "lucide-react";

const transactions = [
  {
    id: "TXN001",
    type: "buy",
    fromCurrency: "USD",
    toCurrency: "BTC",
    fromAmount: "1,500.00",
    toAmount: "0.035142",
    status: "completed",
    timestamp: "2024-01-15 14:30:25",
    rate: "1 BTC = $42,650.00",
    fee: "$0.00",
    hash: "0x1a2b3c4d5e6f7g8h9i0j",
  },
  {
    id: "TXN002",
    type: "sell",
    fromCurrency: "ETH",
    toCurrency: "USD",
    fromAmount: "2.5",
    toAmount: "6,450.00",
    status: "processing",
    timestamp: "2024-01-15 13:45:12",
    rate: "1 ETH = $2,580.00",
    fee: "$3.25",
    hash: "0x2b3c4d5e6f7g8h9i0j1k",
  },
  {
    id: "TXN003",
    type: "buy",
    fromCurrency: "EUR",
    toCurrency: "ADA",
    fromAmount: "500.00",
    toAmount: "1,030.93",
    status: "completed",
    timestamp: "2024-01-15 12:20:45",
    rate: "1 ADA = $0.485",
    fee: "$0.00",
    hash: "0x3c4d5e6f7g8h9i0j1k2l",
  },
  {
    id: "TXN004",
    type: "sell",
    fromCurrency: "BNB",
    toCurrency: "GBP",
    fromAmount: "5.0",
    toAmount: "1,265.50",
    status: "failed",
    timestamp: "2024-01-15 11:15:30",
    rate: "1 BNB = $315.40",
    fee: "$2.50",
    hash: "0x4d5e6f7g8h9i0j1k2l3m",
  },
  {
    id: "TXN005",
    type: "buy",
    fromCurrency: "USD",
    toCurrency: "USDT",
    fromAmount: "1,000.00",
    toAmount: "1,000.00",
    status: "completed",
    timestamp: "2024-01-15 10:30:15",
    rate: "1 USDT = $1.000",
    fee: "$0.00",
    hash: "0x5e6f7g8h9i0j1k2l3m4n",
  },
  {
    id: "TXN006",
    type: "buy",
    fromCurrency: "USD",
    toCurrency: "ETH",
    fromAmount: "2,580.00",
    toAmount: "1.0",
    status: "completed",
    timestamp: "2024-01-14 16:45:22",
    rate: "1 ETH = $2,580.00",
    fee: "$0.00",
    hash: "0x6f7g8h9i0j1k2l3m4n5o",
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

export function TransactionsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromCurrency
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.toCurrency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {paginatedTransactions.map((transaction) => (
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
                    {transaction.timestamp} • ID: {transaction.id}
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(transaction.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm font-medium">
                  {transaction.type === "buy" ? "-" : "+"}
                  {transaction.fromAmount} {transaction.fromCurrency}
                </div>
                <div className="text-xs text-muted-foreground">
                  Fee: {transaction.fee}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}{" "}
              of {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">
              No transactions found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start your first exchange to see your transaction history here"}
            </p>
            {!searchTerm && <Button>Start Exchange</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
