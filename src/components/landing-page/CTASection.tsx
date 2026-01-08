import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section
      className="min-h-screen flex items-center justify-center py-20 bg-transparent sticky z-20"
      id="get-started"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            🔶 Get Started{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Today
            </span>
          </h2>

          <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-200">
            Trade With Confidence. Trade With SwapHubu.
          </h3>

          <p className="text-gray-300 mb-12 text-lg md:text-xl leading-relaxed">
            SwapHubu gives you the tools to move your crypto and fiat quickly,
            transparently, and securely — whether you&apos;re exchanging for
            business or personal needs.
          </p>

          <div className="space-y-6 mb-16">
            <div className="flex items-center justify-center gap-3 text-lg text-gray-300">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Contact our team
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-gray-300">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Complete a one-time KYC verification
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-gray-300">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Start exchanging with confidence
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="#connect"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <p className="text-gray-400 text-sm">
              No hidden fees • Secure transactions • 24/7 support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
