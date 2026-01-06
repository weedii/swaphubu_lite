import Navbar from "./Navbar";
import { twMerge } from "tailwind-merge";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background w-full">
      <Navbar />
      <main className={twMerge("relative", className)}>{children}</main>
    </div>
  );
}
