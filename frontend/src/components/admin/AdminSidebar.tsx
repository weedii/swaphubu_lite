"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  HelpCircle,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { LogoWithGlow } from "@/components/common/logo-with-glow";

// Navigation items configuration
export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      { title: "All Users", href: "/admin/users" },
      { title: "KYC Verifications", href: "/admin/users/kyc" },
      { title: "Blocked Users", href: "/admin/users/blocked" },
    ],
  },
  {
    title: "Transactions",
    icon: CreditCard,
    children: [
      { title: "All Transactions", href: "/admin/transactions" },
      { title: "Pending Transactions", href: "/admin/transactions/pending" },
      { title: "Transaction Reports", href: "/admin/transactions/reports" },
    ],
  },
  {
    title: "Support",
    icon: MessageSquare,
    children: [
      { title: "Support Tickets", href: "/admin/support/tickets" },
      { title: "FAQ Management", href: "/admin/support/faq" },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

// Sidebar content component
function SidebarContent({
  isCollapsed = false,
  onLinkClick,
}: {
  isCollapsed?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Get default expanded items based on current path
  const getDefaultExpandedItems = () => {
    if (isCollapsed) return [];
    const expandedItems: string[] = [];
    adminNavItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          isActive(child.href)
        );
        if (hasActiveChild) {
          expandedItems.push(item.title);
        }
      }
    });
    return expandedItems;
  };

  return (
    <>
      {/* Logo */}
      <div className={cn("p-6 border-b", isCollapsed && "px-4")}>
        <LogoWithGlow
          size="sm"
          glowColor="orange"
          href="/admin"
          className={cn(isCollapsed && "justify-center")}
        />
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground mt-2">Admin Dashboard</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {isCollapsed ? (
          // Collapsed navigation - icons only with tooltips
          <div className="space-y-2">
            {adminNavItems.map((item) => {
              const IconComponent = item.icon;
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                // For collapsed state, show parent as active if any child is active
                const hasActiveChild = item.children.some((child) =>
                  isActive(child.href)
                );

                return (
                  <div key={item.title} className="relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "w-full h-9",
                        hasActiveChild && "bg-accent text-accent-foreground"
                      )}
                      title={item.title}
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>

                    {/* Tooltip */}
                    <div className="fixed left-12 bg-popover text-popover-foreground px-3 py-2 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity z-[30] whitespace-nowrap pointer-events-none border shadow-lg">
                      {item.title}
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.href} className="relative group">
                  <Link href={item.href!} onClick={onLinkClick}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "w-full h-9",
                        isActive(item.href!, item.exact) &&
                          "bg-accent text-accent-foreground"
                      )}
                      title={item.title}
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  </Link>

                  {/* Tooltip */}
                  <div className="fixed left-12 bg-popover text-popover-foreground px-3 py-2 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity z-[9999] whitespace-nowrap pointer-events-none border shadow-lg">
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Expanded navigation - YOUR ORIGINAL ACCORDION DESIGN
          <Accordion
            type="multiple"
            defaultValue={getDefaultExpandedItems()}
            className="space-y-2"
          >
            {adminNavItems.map((item) => {
              const IconComponent = item.icon;
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <AccordionItem
                    key={item.title}
                    value={item.title}
                    className="border-none"
                  >
                    <AccordionTrigger className="hover:no-underline py-0 pl-0 pr-2 hover:bg-accent hover:text-accent-foreground rounded-sm">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-9 px-3",
                          "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                        )}
                        asChild
                      >
                        <div>
                          <IconComponent className="mr-2 h-4 w-4" />
                          <span className="flex-1 text-left">{item.title}</span>
                        </div>
                      </Button>
                    </AccordionTrigger>

                    <AccordionContent className="py-2">
                      <div className="ml-6 space-y-1 flex flex-col gap-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onLinkClick}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start h-8 px-3 text-sm",
                                isActive(child.href)
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {child.title}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              return (
                <div key={item.href} className="mb-2">
                  <Link href={item.href!} onClick={onLinkClick}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-9 px-3",
                        isActive(item.href!, item.exact)
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </Accordion>
        )}
      </nav>

      {/* Footer */}
      <div className={cn("p-4 border-t", isCollapsed && "px-2")}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Need help?</span>
          </div>
        )}
      </div>
    </>
  );
}

export function AdminSidebar({
  className,
  isCollapsed = false,
}: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex bg-card border-r flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
      </div>
    </>
  );
}

// Mobile Sidebar Component
export function MobileAdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate through the admin dashboard sections
        </SheetDescription>
        <div className="flex flex-col h-full bg-card">
          <SidebarContent onLinkClick={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
