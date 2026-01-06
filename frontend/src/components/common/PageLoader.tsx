"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoWithGlow } from "@/components/common/logo-with-glow";

export const PageLoader = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate a brief loading period; adjust as needed
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          <LogoWithGlow size="lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
