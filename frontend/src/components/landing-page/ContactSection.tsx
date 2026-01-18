import React from "react";
import Link from "next/link";
import { Mail, MessageCircle, Phone, Globe, Send } from "lucide-react";

export const ContactSection = () => {
  return (
    <section className="py-20 bg-transparent relative z-20" id="connect">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Connect With Us
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ready to start trading? Get in touch with our team through your
              preferred channel
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            {/* Telegram Card */}
            <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Telegram
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Instant messaging support
                </p>
                <Link
                  href="https://t.me/swaphubu_exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 font-medium text-sm break-all transition-colors duration-200"
                >
                  @swaphubu_exchange
                </Link>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  WhatsApp
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Quick voice & text chat
                </p>
                <Link
                  href="https://wa.me/447449712038"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors duration-200"
                >
                  +44 7449 712038
                </Link>
              </div>
            </div>

            {/* Email Card */}
            <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Email</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Professional support
                </p>
                <Link
                  href="mailto:support@swaphubu.com"
                  className="text-orange-400 hover:text-orange-300 font-medium text-sm break-all transition-colors duration-200"
                >
                  support@swaphubu.com
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Ready to Start Trading?
              </h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust SwapHubu for
                their crypto trading needs. Our team is standing by to help you
                get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://t.me/swaphubu_exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 hover:transform hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start on Telegram
                </Link>
                <Link
                  href="https://wa.me/447449712038"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 bg-transparent border border-orange-500 hover:bg-orange-500/10 text-orange-400 hover:text-orange-300 font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
