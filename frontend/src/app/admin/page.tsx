"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatisticsCards } from "@/components/admin/StatisticsCards";
import {
  getUserStatistics,
  getUnverifiedUsers,
  getBlockedUsers,
  UserStatistics,
  UserList,
} from "@/actions/admin";
import {
  Users,
  UserCheck,
  Ban,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UserList | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, unverifiedResponse, blockedResponse] =
        await Promise.all([
          getUserStatistics(),
          getUnverifiedUsers(7, 1, 5),
          getBlockedUsers(1, 5),
        ]);

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      if (unverifiedResponse.success && unverifiedResponse.data) {
        setUnverifiedUsers(unverifiedResponse.data);
      }

      if (blockedResponse.success && blockedResponse.data) {
        setBlockedUsers(blockedResponse.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the SwapHubu admin dashboard
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards statistics={statistics} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3"
              >
                <Users className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-xs text-muted-foreground">
                    View and manage user accounts
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/users?filter=unverified" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3"
              >
                <UserCheck className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Review KYC</div>
                  <div className="text-xs text-muted-foreground">
                    Pending verifications
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/admin/reports" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3"
              >
                <FileText className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Generate Reports</div>
                  <div className="text-xs text-muted-foreground">
                    System analytics and reports
                  </div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Unverified Users Alert */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unverified Users
            </CardTitle>
            <CardDescription>
              Users pending verification for over 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : unverifiedUsers && unverifiedUsers.users.length > 0 ? (
              <div className="space-y-3">
                {unverifiedUsers.users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}

                {unverifiedUsers.total > 3 && (
                  <Link href="/admin/users?filter=unverified">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {unverifiedUsers.total} unverified users
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No unverified users found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Blocked Users Alert */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Blocked Users
            </CardTitle>
            <CardDescription>Recently blocked user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : blockedUsers && blockedUsers.users.length > 0 ? (
              <div className="space-y-3">
                {blockedUsers.users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-medium">
                      {user.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}

                {blockedUsers.total > 3 && (
                  <Link href="/admin/users?filter=blocked">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all {blockedUsers.total} blocked users
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No blocked users found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
