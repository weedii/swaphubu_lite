"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import {
  Home,
  TrendingUp,
  User,
  HelpCircle,
  Menu,
  LogOut,
  ChevronDown,
  GitCompareArrows,
  Settings,
} from "lucide-react";
import {
  selectIsAuthenticated,
  selectUser,
  selectIsAdmin,
  logoutUser,
} from "@/redux/slices/userSlice";
import { signOut } from "@/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { LogoWithGlow } from "../common/logo-with-glow";

// Navigation routes with icons
const publicRoutes = [
  { name: "Home", route: "/", icon: Home },
  { name: "About", route: "/about", icon: HelpCircle },
];

const privateRoutes = [
  { name: "Home", route: "/home", icon: Home },
  { name: "Exchange", route: "/exchange", icon: TrendingUp },
  { name: "My transactions", route: "/transactions", icon: GitCompareArrows },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const router = useRouter();

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

  const routes = isAuthenticated ? privateRoutes : publicRoutes;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <LogoWithGlow size="sm" glowColor="orange" href="/" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {routes.map((route) => {
            const IconComponent = route.icon;
            return (
              <Link key={route.name} href={route.route}>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{route.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Separator orientation="vertical" className="h-6" />
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.first_name || "User"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg py-1 z-50">
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                      {user?.email}
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    {/* <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link> */}
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
            </>
          ) : (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Link href="/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>
                    <Image
                      src="/swaphubu.webp"
                      alt="SwapHubu"
                      width={130}
                      height={130}
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                  <SheetDescription className="hidden"></SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {routes.map((route) => {
                    const IconComponent = route.icon;
                    return (
                      <Link
                        key={route.name}
                        href={route.route}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{route.name}</span>
                      </Link>
                    );
                  })}

                  {isAuthenticated ? (
                    <>
                      <Separator />
                      <div className="flex flex-col space-y-2">
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {user?.email}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors text-red-600"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div className="flex flex-col space-y-2">
                        <Link href="/signin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
