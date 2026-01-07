"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { User } from "@/actions/admin";
import { format } from "date-fns";

interface UserTableProps {
  users: User[];
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  loading?: boolean;
}

export function UserTable({
  users,
  onViewUser,
  onEditUser,
  onBlockUser,
  onUnblockUser,
  loading = false,
}: UserTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<void>, userId: string) => {
    setActionLoading(userId);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.is_blocked) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="h-3 w-3" />
          Blocked
        </Badge>
      );
    }
    if (!user.is_verified) {
      return (
        <Badge variant="secondary" className="gap-1">
          <UserX className="h-3 w-3" />
          Unverified
        </Badge>
      );
    }
    return (
      <Badge
        variant="default"
        className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      >
        <UserCheck className="h-3 w-3" />
        Verified
      </Badge>
    );
  };

  const getRoleBadge = (user: User) => {
    return user.is_admin ? (
      <Badge
        variant="outline"
        className="gap-1 border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300"
      >
        <UserCheck className="h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1">
        User
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div>
                      <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
                      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-28 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-12 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Registration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.first_name.charAt(0).toUpperCase()}
                      {user.last_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {user.phone_number && (
                      <div className="text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone_number}
                      </div>
                    )}
                    {user.country && (
                      <div className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {user.country}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(user)}</TableCell>
                <TableCell>{getRoleBadge(user)}</TableCell>
                <TableCell>
                  <div className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={actionLoading === user.id}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onViewUser(user)}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEditUser(user)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit user
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.is_blocked ? (
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(() => onUnblockUser(user.id), user.id)
                          }
                          className="cursor-pointer text-green-600"
                          disabled={actionLoading === user.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Unblock user
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(() => onBlockUser(user.id), user.id)
                          }
                          className="cursor-pointer text-red-600"
                          disabled={actionLoading === user.id}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Block user
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
