import React from "react";
import Image from "next/image";

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-transparent sticky z-20" id="features">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* 3D Cube Image */}
          <div className="order-2 md:order-1">
            <Image
              src="/assets/trading-Xv0Dnfnx.png"
              alt="3D Trading Visualization"
              width={500}
              height={500}
              className="w-full h-auto"
              unoptimized
            />
          </div>

          {/* Features Content */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🔶 Exchange <span className="text-primary">Crypto</span> with
              Confidence
            </h2>

            <div className="space-y-6">
              <p className="text-gray-300">
                Welcome to{" "}
                <span className="text-primary font-semibold">SwapHubu</span> —
                the smarter way to trade your crypto. We&apos;ve combined the
                security of regulated financial infrastructure with the
                simplicity of personalized service to create a powerful exchange
                experience.
              </p>

              <p className="text-gray-300">
                Whether you&apos;re a casual trader or a business looking to
                integrate crypto, SwapHubu puts you in control with competitive
                exchange rates, secure transactions, and expert support.
              </p>

              <p className="text-gray-300 font-semibold">
                👉 Contact. Verify. Exchange. It&apos;s that simple.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-300">
                    ✅ KYC-Compliant for Regulatory Peace of Mind
                  </p>
                </div>

                <div>
                  <p className="text-gray-300">
                    ✅ Competitive Rates with Transparent Margins
                  </p>
                </div>

                <div>
                  <p className="text-gray-300">
                    ✅ Fast, Secure, and Fully Compliant
                  </p>
                </div>

                <div>
                  <p className="text-gray-300 mt-4">
                    Start exchanging today — all you need is a verified account
                    and our team handles the rest.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
