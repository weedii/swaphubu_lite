import React from "react";
import { PageLoader } from "@/components/common/PageLoader";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import {
  NavbarSection,
  HeroSection,
  FeaturesSection,
  WhyChooseUsSection,
  HowItWorksSection,
  ComingFeaturesSection,
  FooterSection,
  CTASection,
  ContactSection,
  EncryptionVideoSection,
} from "@/components/landing-page";
import { Metadata } from "next";
import StarsCanvas from "@/components/landing-page/StarBackground";

export const metadata: Metadata = {
  title: "SwapHubu – Your Trusted Crypto Exchange Partner",
  description:
    "SwapHubu — the smarter way to trade your crypto. We've combined the security of regulated financial infrastructure with the simplicity of personalized service.",
};

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen relative">
      {/* Page loader overlay */}
      <PageLoader />

      {/* Background and utilities */}
      <StarsCanvas />

      <NavbarSection />

      <HeroSection />

      <AnimatedSection>
        <FeaturesSection />
      </AnimatedSection>

      <AnimatedSection>
        <WhyChooseUsSection />
      </AnimatedSection>

      <AnimatedSection>
        <HowItWorksSection />
      </AnimatedSection>

      <AnimatedSection>
        <ComingFeaturesSection />
      </AnimatedSection>

      <AnimatedSection>
        <EncryptionVideoSection />
      </AnimatedSection>

      <AnimatedSection>
        <CTASection />
      </AnimatedSection>

      <AnimatedSection>
        <ContactSection />
      </AnimatedSection>

      <FooterSection />
    </div>
  );
}
