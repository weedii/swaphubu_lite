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
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Globe,
  Phone,
} from "lucide-react";
import {
  FormInput,
  FormCountrySelect,
  FormPhoneInput,
  GradientButton,
} from "@/components/common";
import {
  useAppDispatch,
  useAppSelector,
  setLoading,
  setUser,
  setError,
  selectIsLoading,
} from "@/redux";
import { signUp } from "@/actions/auth";
import type { Country } from "@/components/ui/country-dropdown";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      met: formData.password.length >= 8,
      id: "length",
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(formData.password),
      id: "upper",
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(formData.password),
      id: "lower",
    },
    {
      label: "Contains number",
      met: /\d/.test(formData.password),
      id: "number",
    },
    {
      label: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      id: "special",
    },
  ];

  const passwordStrength = passwordRequirements.filter((req) => req.met).length;
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation - handled by FormPhoneInput component
    if (formData.phoneNumber && !isPhoneValid) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    // else if (!passwordRequirements.every((req) => req.met)) {
    //   newErrors.password = "Password does not meet requirements";
    // }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCountrySelect = (country: Country | null) => {
    setSelectedCountry(country);
    // Clear phone number when country changes
    if (formData.phoneNumber) {
      setFormData((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handlePhoneValidation = (isValid: boolean, fullPhone?: string) => {
    setIsPhoneValid(isValid);
    setFullPhoneNumber(fullPhone || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(setLoading(true));

    try {
      // Use the validated full phone number from the phone input component

      const result = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: fullPhoneNumber,
        country: formData.country,
        password: formData.password,
      });

      if (result.success) {
        dispatch(setUser({ user: result.user! }));
        toast.success("Account created successfully!");
        router.push("/home");
      } else {
        dispatch(setError(result.message));
        toast.error(result.message);
      }
    } catch (error) {
      dispatch(setError("An error occurred during sign up"));
      toast.error("An error occurred during sign up");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Shared password toggle state
  const passwordToggleState = {
    showPassword,
    setShowPassword,
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
                  Join SwapHubu
                </GradientHeading>
                <p className="text-muted-foreground">
                  Start your crypto journey with us today
                </p>
              </div>
            </div>
          </SlideUp>

          {/* Sign Up Form */}
          <SlideUp delay={0.2}>
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Create Account
                </CardTitle>
                <CardDescription>
                  Join thousands of users trading with confidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="firstName"
                      type="text"
                      label="First Name"
                      icon={<User className="h-4 w-4" />}
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      error={errors.firstName}
                      variant="primary"
                      autoFocus
                    />
                    <FormInput
                      id="lastName"
                      type="text"
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      error={errors.lastName}
                      variant="secondary"
                    />
                  </div>

                  {/* Email Field */}
                  <FormInput
                    id="email"
                    type="email"
                    label="Email Address"
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    error={errors.email}
                    variant="secondary"
                  />

                  {/* Country Field */}
                  <FormCountrySelect
                    id="country"
                    label="Country"
                    icon={<Globe className="h-4 w-4" />}
                    placeholder="Select your country..."
                    value={formData.country}
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }
                    onCountrySelect={handleCountrySelect}
                    error={errors.country}
                    variant="primary"
                  />

                  {/* Phone Number Field */}
                  <FormPhoneInput
                    id="phoneNumber"
                    label="Phone Number"
                    icon={<Phone className="h-4 w-4" />}
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    onValidationChange={handlePhoneValidation}
                    selectedCountryCode={formData.country}
                    error={errors.phoneNumber}
                    variant="secondary"
                  />

                  {/* Password Field */}
                  <div className="space-y-2">
                    <FormInput
                      id="password"
                      type="password"
                      label="Password"
                      icon={<Lock className="h-4 w-4" />}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      error={errors.password}
                      variant="primary"
                      showPasswordToggle
                      externalPasswordState={passwordToggleState}
                    />

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength <= 1
                                ? "text-red-500"
                                : passwordStrength <= 3
                                ? "text-yellow-500"
                                : passwordStrength <= 4
                                ? "text-blue-500"
                                : "text-green-500"
                            }`}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {passwordRequirements.map((req, index) => (
                            <div
                              key={req.id}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  req.met
                                    ? "bg-green-500"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              >
                                {req.met ? (
                                  <Check className="w-2.5 h-2.5 text-white" />
                                ) : (
                                  <X className="w-2.5 h-2.5 text-gray-400" />
                                )}
                              </div>
                              <span
                                className={`text-xs transition-colors ${
                                  req.met
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <FormInput
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    icon={<Lock className="h-4 w-4" />}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
                    variant="secondary"
                    showPasswordToggle
                    externalPasswordState={passwordToggleState}
                  />

                  {/* Terms Agreement */}

                  {/* Submit Button */}
                  <GradientButton
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Creating account..."
                    icon={<ArrowRight className="h-4 w-4" />}
                    gradientVariant="primary"
                  >
                    Create Account
                  </GradientButton>
                </form>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Sign In Link */}
          <SlideUp delay={0.3}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-orange-600 hover:text-orange-500 dark:text-orange-400 font-medium hover:underline transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </AuthBackground>
  );
}
