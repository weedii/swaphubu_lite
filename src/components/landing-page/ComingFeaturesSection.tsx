import React from "react";
import Image from "next/image";
import {
  ArrowUpDown,
  DollarSign,
  Building2,
  Users,
  Sparkles,
  Rocket,
} from "lucide-react";

export const ComingFeaturesSection = () => {
  return (
    <section
      className="min-h-screen py-20 bg-transparent sticky z-20"
      id="services"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                🔶 Our{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Comprehensive crypto exchange solutions tailored to your needs
              </p>
            </div>

            <div className="space-y-4">
              <div className="group p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <ArrowUpDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Fiat-to-Crypto
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Convert fiat currencies to major cryptocurrencies with
                      competitive rates and full compliance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Crypto-to-Fiat
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Cash out your crypto assets to fiat currencies securely
                      and efficiently.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Business Solutions
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Tailored exchange services for businesses integrating
                      crypto operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Image */}
          <div className="order-1 lg:order-2 flex justify-center sm:mt-28">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
              <Image
                src="/assets/about-Bi7Cn6hQ.png"
                alt="Analytics Dashboard"
                width={600}
                height={500}
                className="relative w-full h-auto max-w-lg rounded-2xl shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          {/* About Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                🔶 About{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Us
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Powered by innovation, driven by trust
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      SwapHubu is a project powered by{" "}
                      <span className="text-orange-400 font-semibold">
                        BinaryPie Ltd
                      </span>
                      , a UK-based solution provider specializing in digital
                      asset services and software development.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      We work with regulated financial partners to ensure every
                      transaction is safe, transparent, and fully compliant with
                      industry standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Our mission is simple: to make crypto exchange accessible,
                      secure, and hassle-free for everyone through transparency
                      and personalized service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Image */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-2xl blur-3xl"></div>
              <Image
                src="/assets/trading-Xv0Dnfnx.png"
                alt="Trading Platform"
                width={600}
                height={500}
                className="relative w-full h-auto max-w-lg rounded-2xl shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              🔶 Full Website{" "}
              <span className="text-primary bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Coming Soon!
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Building the future of crypto exchange
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-gray-300 text-xl leading-relaxed mb-6">
              We&apos;re building a complete platform to enhance your crypto
              exchange experience. For now, enjoy our personal, manual service
              and reach out anytime for your exchange needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
                Advanced Trading Tools
              </span>
              <span className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
                Real-time Analytics
              </span>
              <span className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
                Mobile App
              </span>
              <span className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
                API Integration
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
