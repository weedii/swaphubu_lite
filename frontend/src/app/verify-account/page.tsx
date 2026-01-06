"use client";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated } from "@/redux/slices/userSlice";
import KYCVerification from "@/components/kyc/KYCVerification";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";

export default function VerifyAccountPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Show a loading state while checking authentication
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
      <section className="min-h-screen container mx-auto py-16 flex justify-center items-center">
        <KYCVerification />
      </section>
    </MainLayout>
  );
}
