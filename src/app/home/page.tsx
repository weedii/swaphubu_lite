import { generateMetadata } from "@/lib/metadata";
import { MainLayout } from "@/components/layout/main-layout";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import StatsSection from "@/components/homepage/StatsSection";
import CTASection from "@/components/homepage/CTASection";

export const metadata = generateMetadata({
  title: "Home",
  description:
    "SwapHubu - Seamless fiat to crypto exchange. Buy and sell cryptocurrencies instantly with the best rates.",
  keywords:
    "crypto exchange, buy bitcoin, sell crypto, fiat to crypto, exchange platform",
});

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection />
    </MainLayout>
  );
}
