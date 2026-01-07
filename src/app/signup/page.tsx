import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "Sign Up",
  description: "Create a new account",
});

import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return <SignUpForm />;
}
