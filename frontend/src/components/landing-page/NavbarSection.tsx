"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GradientLink } from "../common/gradient-link";

export const NavbarSection = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#why-choose-us", label: "Why Us" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#services", label: "Services" },
    { href: "#connect", label: "Contact" },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-30 py-4 bg-zinc-950 border-b border-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/swaphubu_logo-B9BPaYze.png"
              alt="SwapHubu Logo"
              width={150}
              height={40}
              className="h-[40px] w-[150px] object-contain"
              unoptimized
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <GradientLink
              href="/signin"
              className="hidden md:flex w-fit px-8"
              gradientVariant="primary"
            >
              Get Started
            </GradientLink>

            {/* <Separator
              orientation="vertical"
              className="h-10 hidden md:block"
            /> */}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="text-gray-300 hover:text-white p-2">
                <Menu size={24} />
                <span className="sr-only">Open menu</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-zinc-950 border-gray-800 p-0"
            >
              <div className="flex flex-col h-full">
                <div className="px-6 py-6 border-b border-gray-800">
                  <SheetTitle className="text-lg font-semibold text-white mb-2">
                    <Image
                      src="/assets/swaphubu_logo-B9BPaYze.png"
                      alt="SwapHubu Logo"
                      width={120}
                      height={30}
                      className="h-[30px] w-[120px] object-contain mb-6"
                      unoptimized
                    />
                  </SheetTitle>
                  <SheetDescription className="hidden"></SheetDescription>

                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors py-2 text-lg"
                        onClick={handleLinkClick}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="mt-auto p-6 border-t border-gray-800">
                  <GradientLink href="/signin" useNextLink>
                    Get Started
                  </GradientLink>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
