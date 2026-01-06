"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getSystemReports,
  getUserStatistics,
  SystemReports,
  UserStatistics,
} from "@/actions/admin";
import {
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [reports, setReports] = useState<SystemReports | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number>(30);

  const loadReports = async (days: number = 30) => {
    setLoading(true);
    try {
      const [reportsResponse, statsResponse] = await Promise.all([
        getSystemReports(days),
        getUserStatistics(),
      ]);

      if (reportsResponse.success && reportsResponse.data) {
        setReports(reportsResponse.data);
      } else {
        toast.error(reportsResponse.message);
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(selectedDays);
  }, [selectedDays]);

  const handleTimeRangeChange = (value: string) => {
    const days = parseInt(value);
    setSelectedDays(days);
  };

  const handleRefresh = () => {
    loadReports(selectedDays);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    toast("Export functionality will be implemented soon", {
      icon: "ℹ️",
      duration: 3000,
    });
  };

  const calculateGrowthRate = (
    data: Array<{ date: string; count: number }>
  ) => {
    if (!data || data.length < 2) return 0;

    const recent = data.slice(-7).reduce((sum, item) => sum + item.count, 0);
    const previous = data
      .slice(-14, -7)
      .reduce((sum, item) => sum + item.count, 0);

    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  };

  const topCountries = statistics?.users_by_country
    ? Object.entries(statistics.users_by_country)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for platform performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedDays.toString()}
            onValueChange={handleTimeRangeChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button onClick={handleExportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Growth Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {reports?.user_growth
                    ? `${calculateGrowthRate(reports.user_growth).toFixed(1)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Weekly growth rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verification Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {reports?.verification_rate
                    ? `${reports.verification_rate.toFixed(1)}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall verification rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {reports?.daily_active_users
                    ? reports.daily_active_users.toLocaleString()
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active in last 24 hours
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Active Users
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">
                  {reports?.monthly_active_users
                    ? reports.monthly_active_users.toLocaleString()
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active in last 30 days
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Growth Trend
            </CardTitle>
            <CardDescription>
              Daily user registrations over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : reports?.user_growth && reports.user_growth.length > 0 ? (
              <div className="h-64 flex items-end gap-2 overflow-x-auto">
                {reports.user_growth.slice(-14).map((item, index) => {
                  const maxCount = Math.max(
                    ...reports.user_growth.map((d) => d.count)
                  );
                  const height =
                    maxCount > 0 ? (item.count / maxCount) * 200 : 10;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 min-w-[40px]"
                    >
                      <div className="text-xs text-muted-foreground">
                        {item.count}
                      </div>
                      <div
                        className="bg-blue-500 rounded-t transition-all duration-500 w-8"
                        style={{ height: `${Math.max(height, 10)}px` }}
                      />
                      <div className="text-xs text-muted-foreground transform rotate-45 origin-bottom-left">
                        {format(new Date(item.date), "MM/dd")}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No growth data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Country Distribution
            </CardTitle>
            <CardDescription>
              Top countries by user registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : topCountries.length > 0 ? (
              <div className="space-y-4">
                {topCountries.map(([country, count], index) => {
                  const total = Object.values(
                    statistics?.users_by_country || {}
                  ).reduce((sum, val) => sum + val, 0);
                  const percentage =
                    total > 0 ? ((count / total) * 100).toFixed(1) : "0";

                  return (
                    <div key={country} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {country}
                          </Badge>
                          <span className="text-sm font-medium">
                            {count} users
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No country data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Trends */}
      {statistics?.monthly_registrations &&
        statistics.monthly_registrations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Monthly Registration Trends
              </CardTitle>
              <CardDescription>
                User registrations by month over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {statistics.monthly_registrations
                  .slice(-12)
                  .map((item, index) => {
                    const maxCount = Math.max(
                      ...statistics.monthly_registrations.map((m) => m.count)
                    );
                    const percentage =
                      maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                    return (
                      <div key={index} className="text-center space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {item.month}
                        </div>
                        <div className="text-2xl font-bold">{item.count}</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${Math.max(10, percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Summary
          </CardTitle>
          <CardDescription>
            Key insights from the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Platform Health</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • Total active users:{" "}
                    {reports?.monthly_active_users || "N/A"}
                  </li>
                  <li>
                    • Verification rate:{" "}
                    {reports?.verification_rate
                      ? `${reports.verification_rate.toFixed(1)}%`
                      : "N/A"}
                  </li>
                  <li>
                    • Top country:{" "}
                    {topCountries[0]
                      ? `${topCountries[0][0]} (${topCountries[0][1]} users)`
                      : "N/A"}
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Growth Metrics</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • Weekly growth:{" "}
                    {reports?.user_growth
                      ? `${calculateGrowthRate(reports.user_growth).toFixed(
                          1
                        )}%`
                      : "N/A"}
                  </li>
                  <li>
                    • Daily active users: {reports?.daily_active_users || "N/A"}
                  </li>
                  <li>• Countries represented: {topCountries.length}</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              Report generated on{" "}
              {format(new Date(), "MMM dd, yyyy 'at' HH:mm")} • Data covers the
              last {selectedDays} days
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
