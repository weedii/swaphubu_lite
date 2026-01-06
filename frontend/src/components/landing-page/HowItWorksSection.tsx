import React from "react";

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-transparent sticky z-20" id="how-it-works">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
          🔶 How It Works
        </h2>

        <div className="flex flex-wrap gap-24">
          {/* Step 1 */}
          <div className="relative">
            {/* Orange Circle */}
            <div className="absolute left-0 top-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>

            {/* Line connecting to next step (only visible on desktop) */}
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-700 hidden md:block"></div>

            {/* Content */}
            <div className="pl-16">
              <h3 className="text-2xl font-bold mb-4">Contact Our Team</h3>
              <p className="text-gray-400">
                Reach out via Telegram, WhatsApp, Discord, or our P2P platforms.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            {/* Orange Circle */}
            <div className="absolute left-0 top-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>

            {/* Line connecting to next step (only visible on desktop) */}
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-700 hidden md:block"></div>

            {/* Content */}
            <div className="pl-16">
              <h3 className="text-2xl font-bold mb-4">Complete Verification</h3>
              <p className="text-gray-400">
                Our streamlined KYC process ensures security and compliance.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            {/* Orange Circle */}
            <div className="absolute left-0 top-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>

            {/* Line connecting to next step (only visible on desktop) */}
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-700 hidden md:block"></div>

            {/* Content */}
            <div className="pl-16">
              <h3 className="text-2xl font-bold mb-4">Request Your Exchange</h3>
              <p className="text-gray-400">
                Tell us what you want to exchange, and we&apos;ll provide a
                personalized quote.
              </p>
            </div>
          </div>
        </div>

        {/* Additional steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
          {/* Step 4 */}
          <div className="relative">
            {/* Orange Circle */}
            <div className="absolute left-0 top-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>

            {/* Line connecting to next step (only visible on desktop) */}
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-700 hidden md:block"></div>

            {/* Content */}
            <div className="pl-16">
              <h3 className="text-2xl font-bold mb-4">Secure Transaction</h3>
              <p className="text-gray-400">
                Send your funds to our provided IBAN or crypto wallet. Once
                received, we process your exchange promptly.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative">
            {/* Orange Circle */}
            <div className="absolute left-0 top-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>

            {/* Line connecting to next step (only visible on desktop) */}
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-700 hidden md:block"></div>

            {/* Content */}
            <div className="pl-16">
              <h3 className="text-2xl font-bold mb-4">Receive Your Assets</h3>
              <p className="text-gray-400">
                Your exchanged assets are sent directly to your specified
                account or wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
