import React from "react";
import { AnimatedCard, FadeIn, SlideUp } from "../ui/animated";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowUpDown, Globe, Shield, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="max-w-screen-xl min-h-screen mx-auto">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <FadeIn>
                <Badge variant="secondary" className="mb-4">
                  🚀 Trusted by 50K+ users worldwide
                </Badge>
                <h1 className="text-4xl font-bold">
                  Exchange Crypto with Confidence
                </h1>
              </FadeIn>

              <SlideUp delay={0.2}>
                <p>
                  The fastest and most secure platform to exchange fiat currency
                  for cryptocurrency. Get the best rates, instant transactions,
                  and 24/7 support.
                </p>
              </SlideUp>

              <SlideUp delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1 sm:flex-none py-3">
                    Start Exchange
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 sm:flex-none py-3"
                  >
                    View Rates
                  </Button>
                </div>
              </SlideUp>

              <SlideUp delay={0.6}>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Instant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Global</span>
                  </div>
                </div>
              </SlideUp>
            </div>

            {/* Exchange Widget */}
            <SlideUp delay={0.3}>
              <AnimatedCard>
                <Card className="p-6 shadow-2xl border-0 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpDown className="h-5 w-5" />
                      Quick Exchange
                    </CardTitle>
                    <CardDescription>
                      Exchange fiat to crypto instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* You Send */}
                    <div className="space-y-2">
                      <p>You Send</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="1000"
                          className="flex-1"
                          type="number"
                        />
                        <Button variant="outline" className="w-20">
                          USD
                        </Button>
                      </div>
                    </div>

                    {/* Exchange Icon */}
                    <div className="flex justify-center py-5">
                      <div className="rounded-full bg-primary/10 p-2">
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                      </div>
                    </div>

                    {/* You Receive */}
                    <div className="space-y-2">
                      <p>You Receive</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="0.023456"
                          className="flex-1"
                          readOnly
                        />
                        <Button variant="outline" className="w-20">
                          BTC
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Exchange Rate */}
                    {/* <div className="flex justify-between text-sm">
                      <p>Exchange Rate</p>
                      <p>1 BTC = $42,650</p>
                    </div> */}

                    <Button className="w-full" size="lg">
                      Exchange Now
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </SlideUp>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
