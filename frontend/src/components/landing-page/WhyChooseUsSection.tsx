import React from "react";

export const WhyChooseUsSection = () => {
  return (
    <section
      className="py-20 bg-transparent text-center sticky z-20"
      id="why-choose-us"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          🔶 Why Choose <span className="text-primary">SWAPHUBU</span>?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              ⚡ Personalized Exchange Service
            </h3>
            <p className="text-gray-400">
              Our dedicated team handles each transaction personally, ensuring
              optimal rates, security, and a smooth experience tailored to your
              specific needs.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              🔐 Verified & Secure by Design
            </h3>
            <p className="text-gray-400">
              Your safety is our priority. SwapHubu follows strict KYC protocols
              to ensure compliance and prevent misuse. Your identity is verified
              once, encrypted, and never sold.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              💱 Transparent Rates & No Hidden Fees
            </h3>
            <p className="text-gray-400">
              No more guesswork. We provide clear, competitive rates with
              transparent margins — what you see is what you get, every time.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              🌍 Global Access, Local Compliance
            </h3>
            <p className="text-gray-400">
              SwapHubu services are available to verified users worldwide. As
              long as your region is supported and you&apos;re verified, you
              have full access to our exchange services.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              🧑‍💻 24/7 Live Human Support
            </h3>
            <p className="text-gray-400">
              Need help? We don&apos;t leave you hanging. Real people are
              available via Telegram, WhatsApp, or Discord to guide you through
              verification or any part of the exchange process.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
