"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  getAllUsers,
  searchUsers,
  blockUser,
  unblockUser,
  getUserById,
  User,
  UserList,
  UserSearchParams,
} from "@/actions/admin";
import { UserTable } from "@/components/admin/UserTable";
import { UserFilters } from "@/components/admin/UserFilters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Globe,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [userList, setUserList] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<UserSearchParams>({
    page: 1,
    limit: 20,
  });

  const loadUsers = async (
    params: UserSearchParams = { page: 1, limit: 20 }
  ) => {
    setLoading(true);
    try {
      const hasFilters = Object.keys(params).some(
        (key) =>
          key !== "page" &&
          key !== "limit" &&
          params[key as keyof UserSearchParams] !== undefined
      );

      const response = hasFilters
        ? await searchUsers(params)
        : await getAllUsers({
            page: params.page,
            limit: params.limit,
            sort_by: "created_at",
            sort_order: "desc",
          });

      if (response.success && response.data) {
        setUserList(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (params: UserSearchParams) => {
    setCurrentFilters(params);
    loadUsers(params);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page };
    setCurrentFilters(newFilters);
    loadUsers(newFilters);
  };

  const handleViewUser = async (user: User) => {
    try {
      const response = await getUserById(user.id);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setShowUserDialog(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details");
    }
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user functionality
    toast("Edit functionality will be implemented soon", {
      icon: "ℹ️",
      duration: 3000,
    });
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const response = await blockUser(userId);
      if (response.success) {
        toast.success("User blocked successfully");
        loadUsers(currentFilters);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const response = await unblockUser(userId);
      if (response.success) {
        toast.success("User unblocked successfully");
        loadUsers(currentFilters);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
    }
  };

  const handleRefresh = () => {
    loadUsers(currentFilters);
  };

  const renderPagination = () => {
    if (!userList || userList.total_pages <= 1) return null;

    const currentPage = userList.page;
    const totalPages = userList.total_pages;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = i + 1;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {totalPages > 5 && <PaginationEllipsis />}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor user accounts across the platform
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline">
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      {userList && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {userList.total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {userList.users.filter((u) => u.is_verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {userList.users.filter((u) => u.is_blocked).length}
                </div>
                <div className="text-sm text-muted-foreground">Blocked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {userList.users.filter((u) => u.is_admin).length}
                </div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <UserFilters onFilter={handleFilter} loading={loading} />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {userList
              ? `Showing ${userList.users.length} of ${userList.total} users`
              : "Loading users..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={userList?.users || []}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            loading={loading}
          />

          {/* Pagination */}
          {userList && userList.total_pages > 1 && (
            <div className="mt-6 flex justify-center">{renderPagination()}</div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedUser.first_name.charAt(0).toUpperCase()}
                  {selectedUser.last_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedUser.is_blocked ? (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Blocked
                      </Badge>
                    ) : selectedUser.is_verified ? (
                      <Badge
                        variant="default"
                        className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                    {selectedUser.is_admin && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300"
                      >
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone_number && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedUser.phone_number}
                        </span>
                      </div>
                    )}
                    {selectedUser.country && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedUser.country}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">Registered</div>
                        <div className="text-xs text-muted-foreground">
                          {format(
                            new Date(selectedUser.created_at),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">Last Updated</div>
                        <div className="text-xs text-muted-foreground">
                          {format(
                            new Date(selectedUser.updated_at),
                            "MMM dd, yyyy 'at' HH:mm"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
