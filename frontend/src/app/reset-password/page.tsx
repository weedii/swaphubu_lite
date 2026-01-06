"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FadeIn, SlideUp } from "@/components/ui/animated";
import {
  AuthBackground,
  GradientHeading,
  LogoWithGlow,
  AuthCheck,
} from "@/components/auth";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Key,
  Lock,
  Shield,
} from "lucide-react";
import { FormInput, GradientButton } from "@/components/common";
import { verifyResetCode, resetPassword, forgotPassword } from "@/actions/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") || "";

  // Form states
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [currentStep, setCurrentStep] = useState<
    "verify" | "reset" | "success"
  >("verify");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Redirect to sign-in page if no email is provided
  useEffect(() => {
    console.log(emailFromUrl);

    if (!emailFromUrl) {
      router.push("/signin");
    }
  }, [emailFromUrl, router]);

  const validateVerifyForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!code) {
      newErrors.code = "Reset code is required";
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.code = "Please enter a valid 6-digit code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateVerifyForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await verifyResetCode(email, code);

      if (result.success) {
        setCurrentStep("reset");
      } else {
        setErrors({ code: result.message });
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateResetForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await resetPassword(email, newPassword, confirmPassword);

      if (result.success) {
        setCurrentStep("success");
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToVerify = () => {
    setCurrentStep("verify");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const handleGoToSignIn = () => {
    router.push("/signin");
  };

  const handleResendCode = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setIsResending(true);
    setErrors({});

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        // Show success message but don't redirect
        setErrors({
          general: "Reset code sent successfully! Check your email.",
        });
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: "Failed to resend code. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  // Success State
  if (currentStep === "success") {
    return (
      <AuthCheck>
        <AuthBackground variant="tertiary">
          <FadeIn>
            <div className="w-full max-w-md space-y-8">
              {/* Success Header */}
              <SlideUp delay={0.1}>
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>

                  <div className="space-y-2">
                    <GradientHeading as="h1" className="text-4xl">
                      Password Reset!
                    </GradientHeading>
                    <p className="text-muted-foreground">
                      Your password has been successfully reset
                    </p>
                  </div>
                </div>
              </SlideUp>

              {/* Success Card */}
              <SlideUp delay={0.2}>
                <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">
                          Password updated successfully!
                        </span>
                      </div>

                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>You can now sign in with your new password.</p>
                        <p>
                          For security, you&apos;ll need to sign in again with
                          your new credentials.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <GradientButton
                        onClick={handleGoToSignIn}
                        gradientVariant="primary"
                        className="w-full"
                        icon={<ArrowRight className="h-4 w-4" />}
                      >
                        Continue to Sign In
                      </GradientButton>
                    </div>
                  </CardContent>
                </Card>
              </SlideUp>
            </div>
          </FadeIn>
        </AuthBackground>
      </AuthCheck>
    );
  }

  // Reset Password Step
  if (currentStep === "reset") {
    return (
      <AuthCheck>
        <AuthBackground variant="secondary">
          <FadeIn>
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <SlideUp delay={0.1}>
                <div className="text-center space-y-6">
                  <LogoWithGlow />

                  <div className="space-y-2">
                    <GradientHeading as="h1" className="text-4xl">
                      Set New Password
                    </GradientHeading>
                    <p className="text-muted-foreground">
                      Enter your new password below
                    </p>
                  </div>
                </div>
              </SlideUp>

              {/* Reset Form */}
              <SlideUp delay={0.2}>
                <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="flex items-center justify-center gap-2 text-xl">
                      <Lock className="h-5 w-5 text-orange-500" />
                      New Password
                    </CardTitle>
                    <CardDescription>
                      Choose a strong password for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {errors.general && (
                      <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        {errors.general}
                      </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-6">
                      {/* New Password Field */}
                      <FormInput
                        id="newPassword"
                        type="password"
                        label="New Password"
                        icon={<Lock className="h-4 w-4" />}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={errors.newPassword}
                        variant="primary"
                      />

                      {/* Confirm Password Field */}
                      <FormInput
                        id="confirmPassword"
                        type="password"
                        label="Confirm Password"
                        icon={<Shield className="h-4 w-4" />}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                        variant="primary"
                      />

                      {/* Submit Button */}
                      <GradientButton
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Updating password..."
                        icon={<ArrowRight className="h-4 w-4" />}
                      >
                        Update Password
                      </GradientButton>
                    </form>
                  </CardContent>
                </Card>
              </SlideUp>

              {/* Back Button */}
              <SlideUp delay={0.3}>
                <div className="text-center">
                  <button
                    onClick={handleBackToVerify}
                    className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 font-medium hover:underline transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to code verification
                  </button>
                </div>
              </SlideUp>
            </div>
          </FadeIn>
        </AuthBackground>
      </AuthCheck>
    );
  }

  // Verify Code Step (Default)
  return (
    <AuthCheck>
      <AuthBackground variant="primary">
        <FadeIn>
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <SlideUp delay={0.1}>
              <div className="text-center space-y-6">
                <LogoWithGlow />

                <div className="space-y-2">
                  <GradientHeading as="h1" className="text-4xl">
                    Enter Reset Code
                  </GradientHeading>
                  <p className="text-muted-foreground">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
              </div>
            </SlideUp>

            {/* Verify Form */}
            <SlideUp delay={0.2}>
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <Key className="h-5 w-5 text-orange-500" />
                    Verify Code
                  </CardTitle>
                  <CardDescription>
                    Check your email for the 6-digit reset code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      {errors.general}
                    </div>
                  )}

                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    {/* Email Display (Non-editable) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium">
                          Email Address
                        </label>
                      </div>
                      <div className="flex items-center p-2 rounded-md bg-muted/30 border border-input cursor-not-allowed">
                        <span className="text-sm text-muted-foreground">
                          {email}
                        </span>
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Code Field */}
                    <FormInput
                      id="code"
                      type="text"
                      label="Reset Code"
                      icon={<Key className="h-4 w-4" />}
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => {
                        // Only allow numbers and limit to 6 digits
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setCode(value);
                      }}
                      error={errors.code}
                      variant="primary"
                      maxLength={6}
                    />

                    {/* Submit Button */}
                    <GradientButton
                      type="submit"
                      isLoading={isLoading}
                      loadingText="Verifying code..."
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      Verify Code
                    </GradientButton>
                  </form>
                </CardContent>
              </Card>
            </SlideUp>

            {/* Resend Code */}
            <SlideUp delay={0.3}>
              <div className="text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 font-medium hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="h-4 w-4" />
                  {isResending ? "Sending..." : "Didn't get email? Send again"}
                </button>
              </div>
            </SlideUp>

            {/* Back to Sign In */}
            <SlideUp delay={0.4}>
              <div className="text-center">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 font-medium hover:underline transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </SlideUp>
          </div>
        </FadeIn>
      </AuthBackground>
    </AuthCheck>
  );
}
