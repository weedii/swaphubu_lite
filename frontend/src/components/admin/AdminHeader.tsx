"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { User, LogOut, ChevronDown, Settings, PanelLeft } from "lucide-react";
import {
  selectUser,
  selectIsAdmin,
  logoutUser,
} from "@/redux/slices/userSlice";
import { signOut } from "@/actions/auth";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface AdminHeaderProps {
  onSidebarToggle?: () => void;
}

export function AdminHeader({ onSidebarToggle }: AdminHeaderProps) {
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    const response = await signOut();
    if (response.success) {
      dispatch(logoutUser());
      toast.success(response.message);
      router.push("/signin");
    }
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - sidebar toggle and title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-9 w-9"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>

        {/* Right side - actions and user menu */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          <Separator orientation="vertical" className="h-6" />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Administrator
                </div>
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg py-1 z-50">
                <div className="px-3 py-2 text-sm border-b">
                  <div className="font-medium">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-muted-foreground">{user?.email}</div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin Settings</span>
                </Link>

                <Separator className="my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
