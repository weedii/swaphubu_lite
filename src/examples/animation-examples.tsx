/**
 * ANIMATION EXAMPLES
 *
 * This file demonstrates how to use the animation system built with Framer Motion
 * for smooth, professional animations throughout your application.
 *
 * Components: Animated, FadeIn, SlideUp, AnimatedCard
 * Location: @/components/ui/animated, @/lib/animations
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Animated,
  FadeIn,
  SlideUp,
  AnimatedCard,
} from "@/components/ui/animated";
import { useState } from "react";

export function AnimationExamples() {
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      {/* BASIC ANIMATIONS */}
      <section>
        <h2 className="mb-6">✨ Basic Animation Components</h2>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FadeIn Animation</CardTitle>
              <CardDescription>Simple opacity transition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FadeIn key={`fadeIn-${animationKey}`}>
                  <div className="p-4 bg-primary/10 rounded-lg border">
                    <p>This content fades in smoothly</p>
                  </div>
                </FadeIn>

                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {`<FadeIn>
  <div>Content that fades in</div>
</FadeIn>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SlideUp Animation</CardTitle>
              <CardDescription>Slides up from bottom with fade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SlideUp key={`slideUp-${animationKey}`} delay={0.2}>
                  <div className="p-4 bg-secondary/50 rounded-lg border">
                    <p>This content slides up from below</p>
                  </div>
                </SlideUp>

                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {`<SlideUp delay={0.2}>
  <div>Content that slides up</div>
</SlideUp>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AnimatedCard (Hover Effect)</CardTitle>
              <CardDescription>
                Hover to see the subtle scale animation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatedCard key={`card-${animationKey}`}>
                  <Card className="cursor-pointer">
                    <CardContent className="p-6">
                      <p>Hover over this card to see the animation</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {`<AnimatedCard>
  <Card className="cursor-pointer">
    <CardContent>Hover me!</CardContent>
  </Card>
</AnimatedCard>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={triggerAnimation}>🔄 Replay Animations</Button>
          </div>
        </div>
      </section>

      {/* ADVANCED ANIMATIONS */}
      <section>
        <h2 className="mb-6">🎯 Advanced Animation Patterns</h2>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staggered Animations</CardTitle>
              <CardDescription>
                Multiple elements animating in sequence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[1, 2, 3].map((item, index) => (
                    <SlideUp
                      key={`stagger-${animationKey}-${item}`}
                      delay={index * 0.1}
                    >
                      <div className="p-3 bg-muted rounded border">
                        <p>
                          Item {item} - Delayed by {index * 0.1}s
                        </p>
                      </div>
                    </SlideUp>
                  ))}
                </div>

                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {`{items.map((item, index) => (
  <SlideUp key={item.id} delay={index * 0.1}>
    <div>Item {item.name}</div>
  </SlideUp>
))}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Animation Variants</CardTitle>
              <CardDescription>
                Using the Animated component with different variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Animated
                    key={`scale-${animationKey}`}
                    variant="scale"
                    delay={0.1}
                  >
                    <div className="p-4 bg-primary/10 rounded-lg border">
                      <Badge variant="secondary">Scale</Badge>
                      <p className="mt-2">Scales from 90% to 100%</p>
                    </div>
                  </Animated>

                  <Animated
                    key={`cardHover-${animationKey}`}
                    variant="cardHover"
                    delay={0.2}
                  >
                    <div className="p-4 bg-secondary/10 rounded-lg border cursor-pointer">
                      <Badge variant="secondary">Card Hover</Badge>
                      <p className="mt-2">Hover for scale effect</p>
                    </div>
                  </Animated>
                </div>

                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {`<Animated variant="scale" delay={0.1}>
  <div>Scales in</div>
</Animated>

<Animated variant="cardHover">
  <div>Hover effect</div>
</Animated>`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* REAL WORLD EXAMPLES */}
      <section>
        <h2 className="mb-6">🌟 Real World Examples</h2>

        <Card>
          <CardHeader>
            <CardTitle>Trading Dashboard Layout</CardTitle>
            <CardDescription>
              Example of how animations enhance user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FadeIn key={`dashboard-title-${animationKey}`}>
                <h3>Portfolio Overview</h3>
              </FadeIn>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Total Balance",
                    value: "$124,567",
                    change: "+2.34%",
                  },
                  { title: "Today's P&L", value: "$2,891", change: "+1.23%" },
                  { title: "Open Positions", value: "12", change: "Active" },
                ].map((stat, index) => (
                  <SlideUp
                    key={`stat-${animationKey}-${index}`}
                    delay={0.1 + index * 0.1}
                  >
                    <AnimatedCard>
                      <Card className="cursor-pointer">
                        <CardContent className="p-4">
                          <p>{stat.title}</p>
                          <p>{stat.value}</p>
                          <p>{stat.change}</p>
                        </CardContent>
                      </Card>
                    </AnimatedCard>
                  </SlideUp>
                ))}
              </div>

              <details className="mt-6">
                <summary className="cursor-pointer font-medium">
                  🔍 View Implementation Code
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                  {`<FadeIn>
  <h3>Portfolio Overview</h3>
</FadeIn>

<div className="grid md:grid-cols-3 gap-4">
  {stats.map((stat, index) => (
    <SlideUp key={stat.id} delay={0.1 + index * 0.1}>
      <AnimatedCard>
        <Card className="cursor-pointer">
          <CardContent>
            <p>{stat.title}</p>
            <p>{stat.value}</p>
            <p>{stat.change}</p>
          </CardContent>
        </Card>
      </AnimatedCard>
    </SlideUp>
  ))}
</div>`}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ANIMATION LIBRARY */}
      <section>
        <h2 className="mb-6">🎨 Animation Library Reference</h2>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Variants</CardTitle>
              <CardDescription>
                Pre-built animation variants you can use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>Basic Variants:</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      • <p>fadeIn</p> - Simple opacity transition
                    </li>
                    <li>
                      • <p>slideUp</p> - Slide from bottom with fade
                    </li>
                    <li>
                      • <p>slideDown</p> - Slide from top with fade
                    </li>
                    <li>
                      • <p>slideLeft</p> - Slide from right with fade
                    </li>
                    <li>
                      • <p>slideRight</p> - Slide from left with fade
                    </li>
                  </ul>
                </div>
                <div>
                  <p>Interactive Variants:</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      • <p>scale</p> - Scale from 90% to 100%
                    </li>
                    <li>
                      • <p>cardHover</p> - Hover scale effect
                    </li>
                    <li>
                      • <p>stagger</p> - For parent containers
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Props</CardTitle>
              <CardDescription>
                Customize animations with these props
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p>delay</p> - Delay before animation starts (in seconds)
                  <p className="ml-2">Example: delay={0.2}</p>
                </div>
                <div>
                  <p>duration</p> - Animation duration (in seconds)
                  <p className="ml-2">Example: duration={0.5}</p>
                </div>
                <div>
                  <p>variant</p> - Animation type to use
                  <p className="ml-2">Example: variant=&quot;slideUp&quot;</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PERFORMANCE TIPS */}
      <section>
        <h2 className="mb-6">⚡ Performance Tips</h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✅ Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Use animations sparingly for better performance</p>
              <p>• Prefer transform and opacity changes over layout changes</p>
              <p>
                • Add <p>will-change: transform</p> for complex animations
              </p>
              <p>
                • Use <p>disableTransitionOnChange</p> for theme changes
              </p>
              <p>• Test animations on slower devices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                🎯 When to Use Animations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Page transitions and loading states</p>
              <p>• Drawing attention to important elements</p>
              <p>• Providing feedback for user interactions</p>
              <p>• Creating smooth hover and focus effects</p>
              <p>• Enhancing the perceived performance</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
