import React from "react";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section
      className="min-h-screen flex items-center justify-center py-20 bg-transparent sticky z-20"
      id="get-started"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            🔶 Get Started Today
          </h2>

          <h3 className="text-2xl font-semibold mb-8 text-primary">
            Trade With Confidence. Trade With SwapHubu.
          </h3>

          <p className="text-gray-300 mb-10 text-lg">
            SwapHubu gives you the tools to move your crypto and fiat quickly,
            transparently, and securely — whether you&apos;re exchanging for
            business or personal needs.
          </p>

          <div className="space-y-4 mb-12">
            <p className="text-lg text-gray-300">🔸 Contact our team</p>
            <p className="text-lg text-gray-300">
              🔸 Complete a one-time KYC verification
            </p>
            <p className="text-lg text-gray-300">
              🔸 Start exchanging with confidence
            </p>
          </div>

          <Link
            href="#connect"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-md text-lg font-semibold transition-all duration-300 inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </section>
  );
};
