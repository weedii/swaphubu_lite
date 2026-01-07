"use client";

import { useState } from "react";
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
import { Mail, ArrowRight, ArrowLeft, Key } from "lucide-react";
import { FormInput, GradientButton } from "@/components/common";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        // Redirect directly to reset password page with email
        window.location.href = `/reset-password?email=${encodeURIComponent(
          email
        )}`;
      } else {
        setErrors({ email: result.message });
      }
    } catch (error) {
      setErrors({ email: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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
                    Forgot Password?
                  </GradientHeading>
                  <p className="text-muted-foreground">
                    No worries! We&apos;ll send you reset instructions
                  </p>
                </div>
              </div>
            </SlideUp>

            {/* Reset Form */}
            <SlideUp delay={0.2}>
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <Key className="h-5 w-5 text-orange-500" />
                    Reset Password
                  </CardTitle>
                  <CardDescription>
                    Enter your email address and we&apos;ll send you a code to
                    reset your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <FormInput
                      id="email"
                      type="email"
                      label="Email Address"
                      icon={<Mail className="h-4 w-4" />}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                      variant="primary"
                    />

                    {/* Submit Button */}
                    <GradientButton
                      type="submit"
                      isLoading={isLoading}
                      loadingText="Sending reset code..."
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      Send Reset Code
                    </GradientButton>
                  </form>
                </CardContent>
              </Card>
            </SlideUp>

            {/* Back to Sign In */}
            <SlideUp delay={0.3}>
              <div className="text-center">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 font-medium hover:underline transition-all"
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
