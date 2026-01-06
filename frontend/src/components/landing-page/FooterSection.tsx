import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer className="bg-transparent py-16 border-t border-gray-800 sticky z-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <div className="mb-4">
              <Image
                src="/assets/swaphubu_logo-B9BPaYze.png"
                alt="SwapHubu Logo"
                width={150}
                height={50}
                className="h-10 w-auto"
                unoptimized
              />
            </div>
            <p className="text-gray-400 text-sm mb-2">
              SwapHubu - Powered by BinaryPie Ltd
            </p>
            <p className="text-gray-400 text-sm">UK-based solution provider</p>
          </div>

          {/* Pages Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Exchange Services
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Business Solutions
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#get-started"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors w-fit">
                <Mail className="w-4 h-4" />
                <Link href="mailto:support@swaphubu.com">
                  support@swaphubu.com
                </Link>
              </p>

              <p className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors w-fit">
                <MessageCircle className="w-4 h-4" />
                <Link
                  href="https://t.me/swaphubu_exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </Link>
              </p>

              <p className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors w-fit">
                <Phone className="w-4 h-4" />
                <Link
                  href="https://wa.me/447727843222"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </Link>
              </p>
              <p className="flex items-center text-gray-400 mt-4 text-xs">
                &copy; {new Date().getFullYear()} SwapHubu. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
