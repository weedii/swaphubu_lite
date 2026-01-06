"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
} from "@/components/auth";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { FormInput, GradientButton } from "@/components/common";
import {
  useAppDispatch,
  useAppSelector,
  setLoading,
  setUser,
  setError,
  selectIsLoading,
} from "@/redux";
import { signIn } from "@/actions/auth";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(setLoading(true));

    try {
      const result = await signIn({ email, password });

      if (result.success) {
        dispatch(setUser({ user: result.user! }));
        toast.success("Signed in successfully!");
        router.push("/home");
      } else {
        dispatch(setError(result.message));
        toast.error(result.message);
      }
    } catch (error) {
      dispatch(setError("An error occurred during sign in"));
      toast.error("An error occurred during sign in");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <AuthBackground variant="primary">
      <FadeIn>
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <SlideUp delay={0.1}>
            <div className="text-center space-y-6">
              <LogoWithGlow />

              <div className="space-y-2">
                <GradientHeading as="h1" className="text-4xl">
                  Welcome Back
                </GradientHeading>
                <p className="text-muted-foreground">
                  Sign in to continue your crypto journey
                </p>
              </div>
            </div>
          </SlideUp>

          {/* Sign In Form */}
          <SlideUp delay={0.2}>
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
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
                    autoFocus
                  />

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 transition-colors hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormInput
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      variant="secondary"
                      showPasswordToggle
                    />
                  </div>

                  {/* Submit Button */}
                  <GradientButton
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    icon={<ArrowRight className="h-4 w-4" />}
                    gradientVariant="primary"
                  >
                    Sign In
                  </GradientButton>
                </form>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Sign Up Link */}
          <SlideUp delay={0.3}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-orange-600 hover:text-orange-500 dark:text-orange-400 font-medium hover:underline transition-all"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </AuthBackground>
  );
}
