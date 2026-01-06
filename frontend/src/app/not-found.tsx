"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { GradientHeading } from "@/components/common/gradient-heading";
import { GradientButton } from "@/components/common";
import { FadeIn, SlideUp, Shake } from "@/components/ui/animated";
import { Home } from "lucide-react";

export default function NotFound() {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Delay the error animation for dramatic effect
    const timer = setTimeout(() => {
      setShowError(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <FadeIn>
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-[20rem] font-bold text-primary">404</div>
            </div>

            <div className="relative z-10 py-20">
              <SlideUp delay={0.2}>
                <GradientHeading
                  as="h1"
                  className="text-8xl mb-2"
                  variant="primary"
                >
                  404
                </GradientHeading>
              </SlideUp>

              <SlideUp delay={0.3}>
                <GradientHeading
                  as="h2"
                  className="text-2xl mb-6"
                  variant="secondary"
                >
                  Page Not Found
                </GradientHeading>
              </SlideUp>

              {showError && (
                <Shake>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 my-6 text-orange-600 dark:text-orange-400">
                    <p>
                      The page you&apos;re looking for doesn&apos;t exist or has
                      been moved.
                    </p>
                  </div>
                </Shake>
              )}
            </div>
          </div>
        </FadeIn>

        <SlideUp delay={0.5}>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Let&apos;s get you back on track. Return to the homepage or
              explore other sections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link href="/">
                <GradientButton
                  gradientVariant="primary"
                  icon={<Home className="h-4 w-4" />}
                  className="sm:w-52 w-full"
                >
                  Back to Home
                </GradientButton>
              </Link>

              {/* <GradientButton
                gradientVariant="secondary"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => router.back()}
              >
                Go Back
              </GradientButton> */}
            </div>
          </div>
        </SlideUp>

        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/5 dark:bg-primary/10"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: Math.random() * 0.5 + 0.1,
                scale: 1,
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
