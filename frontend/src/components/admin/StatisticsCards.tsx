"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  UserX,
  Ban,
  Shield,
  TrendingUp,
  Calendar,
  Globe,
} from "lucide-react";
import { UserStatistics } from "@/actions/admin";

interface StatisticsCardsProps {
  statistics: UserStatistics | null;
  loading?: boolean;
}

export function StatisticsCards({
  statistics,
  loading = false,
}: StatisticsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No statistics available
          </CardContent>
        </Card>
      </div>
    );
  }

  const verificationRate =
    statistics.total_users && statistics.total_users > 0
      ? (
          ((statistics.verified_users || 0) / statistics.total_users) *
          100
        ).toFixed(1)
      : "0";

  const blockRate =
    statistics.total_users && statistics.total_users > 0
      ? (
          ((statistics.blocked_users || 0) / statistics.total_users) *
          100
        ).toFixed(1)
      : "0";

  const adminRate =
    statistics.total_users && statistics.total_users > 0
      ? (
          ((statistics.admin_users || 0) / statistics.total_users) *
          100
        ).toFixed(1)
      : "0";

  const topCountries = Object.entries(statistics.users_by_country || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.total_users?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics.recent_registrations || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.verified_users?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {verificationRate}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unverified Users
            </CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.unverified_users?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.blocked_users?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {blockRate}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.admin_users?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {adminRate}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Registrations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.recent_registrations?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
            <Globe className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCountries.length > 0 ? (
                topCountries.map(([country, count], index) => (
                  <div
                    key={country}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {country}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Registrations */}
      {statistics.monthly_registrations &&
        statistics.monthly_registrations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Registration Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {statistics.monthly_registrations
                  .slice(-6)
                  .map((item, index) => (
                    <div key={index} className="text-center space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        {item.month}
                      </div>
                      <div className="text-xl font-bold">{item.count}</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{
                            width: `${Math.max(
                              10,
                              (item.count /
                                Math.max(
                                  ...statistics.monthly_registrations.map(
                                    (m) => m.count
                                  )
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
