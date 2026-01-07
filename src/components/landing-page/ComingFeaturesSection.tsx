import React from "react";
import Image from "next/image";
import { ArrowUpDown, DollarSign, Building2, Users } from "lucide-react";

export const ComingFeaturesSection = () => {
  return (
    <section
      className="min-h-screen py-20 bg-transparent sticky z-20"
      id="services"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              🔶 Our <span className="text-primary">Services</span>
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ArrowUpDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Fiat-to-Crypto Exchange:
                  </h3>
                  <p className="text-gray-400">
                    Convert your fiat currencies to major cryptocurrencies with
                    competitive rates and full compliance.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Crypto-to-Fiat Exchange:
                  </h3>
                  <p className="text-gray-400">
                    Cash out your crypto assets to fiat currencies securely and
                    efficiently.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Business Solutions:
                  </h3>
                  <p className="text-gray-400">
                    Tailored exchange services for businesses looking to
                    integrate crypto into their operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    P2P Trading Options:
                  </h3>
                  <p className="text-gray-400">
                    Available on leading P2P platforms for additional
                    flexibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Image */}
          <div className="mt-12">
            <Image
              src="/assets/about-Bi7Cn6hQ.png"
              alt="Analytics Dashboard"
              width={600}
              height={500}
              className="w-full h-auto"
              unoptimized
            />
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            🔶 About Us
          </h2>
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                SwapHubu is a project powered by{" "}
                <span className="text-orange-400 font-semibold">
                  BinaryPie Ltd
                </span>
                , a UK-based solution provider specializing in digital asset
                services and software development. We work with regulated
                financial partners to ensure every transaction is safe,
                transparent, and fully compliant.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our mission is simple: to make crypto exchange accessible,
                secure, and hassle-free for everyone. We believe in building
                trust through transparency, security, and personalized service.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            🔶 Full Website Coming Soon!
          </h2>
          <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-gray-300 text-lg leading-relaxed">
              We&apos;re building a complete platform to enhance your crypto
              exchange experience. For now, enjoy our personal, manual service
              and reach out anytime for your exchange needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
