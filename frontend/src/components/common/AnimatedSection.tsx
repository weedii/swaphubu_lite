"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedSectionProps
  extends Omit<
    HTMLMotionProps<"div">,
    "initial" | "whileInView" | "viewport" | "transition"
  > {
  children: React.ReactNode;
  /**
   * Viewport amount (between 0 and 1) to trigger the animation.
   * Defaults to 0.2 (20% of the section must be visible).
   */
  amount?: number;
}

export const AnimatedSection = ({
  children,
  className,
  amount = 0.2,
  ...rest
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
