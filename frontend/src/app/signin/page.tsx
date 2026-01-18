import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Sign In",
  description: "Sign in to your account",
});

import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
  return <SignInForm />;
}
