"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { UserProfile } from "@/components/profile/UserProfile";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <UserProfile />
      </div>
    </MainLayout>
  );
}
