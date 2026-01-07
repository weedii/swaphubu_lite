"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, Calendar } from "lucide-react";
import { UserSearchParams } from "@/actions/admin";

interface UserFiltersProps {
  onFilter: (params: UserSearchParams) => void;
  loading?: boolean;
}

export function UserFilters({ onFilter, loading = false }: UserFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("");
  const [isVerified, setIsVerified] = useState<string>("all");
  const [isBlocked, setIsBlocked] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState<string>("all");
  const [registrationStart, setRegistrationStart] = useState("");
  const [registrationEnd, setRegistrationEnd] = useState("");

  const handleSearch = () => {
    const params: UserSearchParams = {
      page: 1,
      limit: 20,
    };

    if (searchTerm.trim()) params.search_term = searchTerm.trim();
    if (country) params.country = country;
    if (isVerified !== "all") params.is_verified = isVerified === "true";
    if (isBlocked !== "all") params.is_blocked = isBlocked === "true";
    if (isAdmin !== "all") params.is_admin = isAdmin === "true";
    if (registrationStart) params.registration_start = registrationStart;
    if (registrationEnd) params.registration_end = registrationEnd;

    onFilter(params);
  };

  const handleClear = () => {
    setSearchTerm("");
    setCountry("");
    setIsVerified("all");
    setIsBlocked("all");
    setIsAdmin("all");
    setRegistrationStart("");
    setRegistrationEnd("");
    onFilter({ page: 1, limit: 20 });
  };

  const hasActiveFilters =
    searchTerm.trim() ||
    country ||
    isVerified !== "all" ||
    isBlocked !== "all" ||
    isAdmin !== "all" ||
    registrationStart ||
    registrationEnd;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Search by email, first name, or last name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Country Filter */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Country code (e.g., US, GB)"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>

          {/* Verification Status */}
          <div className="space-y-2">
            <Label>Verification Status</Label>
            <Select value={isVerified} onValueChange={setIsVerified}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Block Status */}
          <div className="space-y-2">
            <Label>Block Status</Label>
            <Select value={isBlocked} onValueChange={setIsBlocked}>
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="false">Active users</SelectItem>
                <SelectItem value="true">Blocked users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Status */}
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select value={isAdmin} onValueChange={setIsAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="false">Regular users</SelectItem>
                <SelectItem value="true">Admin users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registration Date Range */}
          <div className="space-y-2">
            <Label htmlFor="reg-start">Registration From</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="reg-start"
                type="date"
                value={registrationStart}
                onChange={(e) => setRegistrationStart(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-end">Registration To</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="reg-end"
                type="date"
                value={registrationEnd}
                onChange={(e) => setRegistrationEnd(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Users
          </Button>

          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClear} disabled={loading}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <div className="text-sm text-muted-foreground">Active filters:</div>
            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                Search: {searchTerm}
              </span>
            )}
            {country && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                Country: {country}
              </span>
            )}
            {isVerified !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                {isVerified === "true" ? "Verified" : "Unverified"}
              </span>
            )}
            {isBlocked !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                {isBlocked === "true" ? "Blocked" : "Active"}
              </span>
            )}
            {isAdmin !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                {isAdmin === "true" ? "Admin" : "User"}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
