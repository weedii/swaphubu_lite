import React from "react";
import { AnimatedCard, FadeIn, SlideUp } from "../ui/animated";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-screen-xl mx-auto">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="mb-4">Why Choose SwapHubu?</h2>
              <p className="max-w-2xl mx-auto">
                Experience the future of cryptocurrency exchange with our
                cutting-edge platform designed for both beginners and experts.
              </p>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                description:
                  "Complete exchanges in under 60 seconds with our optimized infrastructure and real-time processing.",
                delay: 0.1,
              },
              {
                icon: "🔒",
                title: "Bank-Level Security",
                description:
                  "Your funds are protected with military-grade encryption, multi-signature wallets, and cold storage.",
                delay: 0.2,
              },
              {
                icon: "💰",
                title: "Best Rates",
                description:
                  "Get the most competitive exchange rates with transparent pricing and no hidden fees.",
                delay: 0.3,
              },
              {
                icon: "🌍",
                title: "Global Access",
                description:
                  "Exchange cryptocurrencies from anywhere in the world with support for 150+ countries.",
                delay: 0.4,
              },
              {
                icon: "📱",
                title: "Mobile Ready",
                description:
                  "Trade on the go with our responsive web platform that works perfectly on all devices.",
                delay: 0.5,
              },
              {
                icon: "🎯",
                title: "24/7 Support",
                description:
                  "Get help whenever you need it with our round-the-clock customer support team.",
                delay: 0.6,
              },
            ].map((feature, index) => (
              <SlideUp key={index} delay={feature.delay}>
                <AnimatedCard>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{feature.description}</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
