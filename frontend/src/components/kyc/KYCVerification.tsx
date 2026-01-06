import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/gradient-button";
import { GradientHeading } from "@/components/common/gradient-heading";
import { FadeIn, SlideUp } from "@/components/ui/animated";
import { useSelector } from "react-redux";
import {
  selectUser,
  KYCStatus,
  updateKycStatus,
} from "@/redux/slices/userSlice";
import { startKYC, getKYCStatus, retryKYC } from "@/actions/kyc";
import { useDispatch } from "react-redux";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ShieldCheck,
  FileText,
  UserCheck,
  Shield,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock4,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

// Extended KYC status to include all backend statuses
type ExtendedKYCStatus = KYCStatus;

const KYCVerification = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycData, setKycData] = useState<any>(null);

  const fetchKycStatus = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getKYCStatus(user.id);
      if (response.success && response.data) {
        setKycData(response.data);
        console.log(response);

        // Update KYC status in Redux - all statuses are now supported
        const reduxStatus: KYCStatus = response.data.status as KYCStatus;
        dispatch(updateKycStatus(reduxStatus));
      } else {
        // No KYC record found is not an error
        setKycData(null);
      }
    } catch (err) {
      setError("Failed to fetch KYC status");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (user?.id) {
      fetchKycStatus();
    }
  }, [user?.id, fetchKycStatus]);

  const handleStartKYC = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await startKYC({ userId: user.id });

      if (response.success && response.data) {
        setKycData(response.data);
        dispatch(updateKycStatus("initiated"));

        // If we have a verification URL, redirect to it
        if (response.data.verification_url) {
          await fetchKycStatus();
          window.open(response.data.verification_url, "_blank");
        }
      } else {
        setError("Failed to start KYC verification");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchKycStatus();
  };

  const handleRetryKYC = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await retryKYC(user.id);

      if (response.success && response.data) {
        setKycData(response.data);
        dispatch(updateKycStatus("pending"));

        // If we have a verification URL, redirect to it
        if (response.data.verification_url) {
          await fetchKycStatus();
          window.open(response.data.verification_url, "_blank");
        }
      } else {
        setError(response.message || "Failed to start KYC retry");
      }
    } catch (err) {
      setError("An unexpected error occurred during retry");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          title: "Verification Complete",
          description: "Your identity has been successfully verified",
          message:
            "Your account is now fully verified and you have access to all platform features.",
        };
      case "declined":
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          title: "Verification Declined",
          description: "Your verification was not approved",
          message:
            "Please review your documents and try again with valid identification.",
        };
      case "pending":
        return {
          icon: <Clock4 className="h-8 w-8 text-orange-500" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          borderColor: "border-orange-200 dark:border-orange-800",
          title: "Verification in Progress",
          description: "Your documents are being reviewed",
          message:
            "Our team is currently reviewing your submitted documents. This usually takes 1-3 business days.",
        };
      case "initiated":
        return {
          icon: <FileText className="h-8 w-8 text-blue-500" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          title: "Verification Started",
          description: "Please complete your verification",
          message:
            "Click the button below to continue with your identity verification process.",
        };
      case "retry_pending":
        return {
          icon: <RefreshCw className="h-8 w-8 text-yellow-500" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          title: "Retry Available",
          description: "Your verification can be retried",
          message:
            "Your previous verification was declined due to technical issues. You can retry the verification process.",
        };
      case "cancelled":
        return {
          icon: <AlertTriangle className="h-8 w-8 text-gray-500" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          title: "Verification Cancelled",
          description: "Your verification was cancelled",
          message: "You can start a new verification process at any time.",
        };
      default:
        return {
          icon: <ShieldCheck className="h-8 w-8 text-gray-500" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          title: "Identity Verification",
          description: "Verify your identity to unlock all features",
          message:
            "Complete identity verification to enhance your account security and access all platform features.",
        };
    }
  };

  const renderVerificationCard = () => {
    if (!kycData) {
      const config = getStatusConfig("default");
      return (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <SlideUp>
            <div className="text-center space-y-4">
              <GradientHeading className="text-4xl font-bold" variant="primary">
                Identity Verification
              </GradientHeading>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete your identity verification to unlock all platform
                features and enhance your account security
              </p>
            </div>
          </SlideUp>

          {/* Main Card */}
          <SlideUp delay={0.1}>
            <Card className="border-2 border-opacity-50 shadow-lg overflow-hidden relative">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 absolute top-4 right-4 z-10 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10 text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-4 rounded-full ${config.bgColor} ${config.borderColor} border-2`}
                  >
                    {config.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {config.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">Enhanced Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with verified identity
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Full Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Unlock all platform features and services
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Quick Process</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete verification in just a few minutes
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <GradientButton
                    onClick={handleStartKYC}
                    isLoading={isLoading}
                    loadingText="Starting verification..."
                    gradientVariant="primary"
                    className="px-8 py-3 text-lg"
                  >
                    Start Verification
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </GradientButton>
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      );
    }

    const status = kycData.status;
    const config = getStatusConfig(status);
    const isCompleted = status === "verified";
    const isPending = status === "pending";
    const isDeclined = status === "declined";
    const isInitiated = status === "initiated";
    const isCancelled = status === "cancelled";
    const isRetryPending = status === "retry_pending";

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <SlideUp>
          <div className="text-center space-y-4">
            <GradientHeading className="text-4xl font-bold" variant="primary">
              Identity Verification
            </GradientHeading>
            <p className="text-lg text-muted-foreground">
              Track your verification status and complete the process
            </p>
          </div>
        </SlideUp>

        {/* Status Card */}
        <SlideUp delay={0.1}>
          <Card className="border-2 border-opacity-50 shadow-lg overflow-hidden relative">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 absolute top-4 right-4 z-10 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <CardHeader className="bg-gradient-to-r from-orange-500/10 to-gray-500/10 text-center">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 rounded-full ${config.bgColor} ${config.borderColor} border-2`}
                >
                  {config.icon}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {config.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {config.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className={`text-base px-4 py-2 ${config.color} ${config.bgColor} ${config.borderColor} border`}
                  >
                    {status && status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="max-w-2xl mx-auto text-center">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {kycData.message || config.message}
                  </p>
                  {isDeclined && kycData.decline_reasons && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Decline reason:</strong>{" "}
                        {kycData.decline_reasons}
                      </p>
                    </div>
                  )}
                </div>

                {isInitiated && kycData.verification_url && (
                  <div className="text-center space-y-4">
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Continue Your Verification
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Click the button below to complete your verification
                        process
                      </p>
                      <GradientButton
                        onClick={() =>
                          window.open(kycData.verification_url, "_blank")
                        }
                        gradientVariant="primary"
                        className="px-8 py-3 text-lg"
                      >
                        Continue Verification
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </GradientButton>
                    </div>
                  </div>
                )}

                {isPending && kycData.verification_url && (
                  <div className="text-center space-y-4">
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Complete Your Verification
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Click the button below to complete your verification
                        process
                      </p>
                      <GradientButton
                        onClick={() =>
                          window.open(kycData.verification_url, "_blank")
                        }
                        gradientVariant="primary"
                        className="px-8 py-3 text-lg"
                      >
                        Complete Verification
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </GradientButton>
                    </div>
                  </div>
                )}

                {isRetryPending && (
                  <div className="text-center space-y-4">
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Retry Your Verification
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Your previous verification was declined due to technical
                        issues. Click below to start a new verification process.
                      </p>
                      <GradientButton
                        onClick={handleRetryKYC}
                        isLoading={isLoading}
                        loadingText="Starting retry..."
                        gradientVariant="primary"
                        className="px-8 py-3 text-lg"
                      >
                        Start Retry Verification
                        <RefreshCw className="ml-2 h-5 w-5" />
                      </GradientButton>
                    </div>
                  </div>
                )}

                {(isDeclined || isCancelled) && (
                  <div className="text-center">
                    <GradientButton
                      onClick={handleStartKYC}
                      isLoading={isLoading}
                      gradientVariant="primary"
                      className="px-8 py-3 text-lg"
                    >
                      Try Again
                    </GradientButton>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    );
  };

  return (
    <div className="w-full py-12 px-4">
      {error && (
        <SlideUp>
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-lg text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        </SlideUp>
      )}
      <FadeIn>{renderVerificationCard()}</FadeIn>
    </div>
  );
};

export default KYCVerification;
