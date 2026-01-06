import React from "react";
import Image from "next/image";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 text-center max-w-7xl mx-auto">
      {/* Black hole background - video for large screens, image for small */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="rotate-180 absolute top-[-365px] left-0 z-10 w-full h-full object-cover hidden md:block"
        >
          <source src="/assets/orangehole-CC21BD4g.webm" type="video/webm" />
        </video>
        <div className="md:hidden rotate-180 absolute top-[-335px] left-0 z-10 w-full h-full">
          <Image
            src="/assets/blackhole-Ci4srdti.png"
            alt="Black hole"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="sticky top-0 z-20">
        {/* Logo */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-center mb-10 mt-20">
            <Image
              src="/assets/swaphubu_logo-B9BPaYze.png"
              alt="SwapHubu Logo"
              width={180}
              height={60}
              className="h-16 w-auto"
              unoptimized
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            SwapHubu – Your Trusted <span className="text-primary">Crypto</span>{" "}
            Exchange Partner
            <br />
            <span className="block mt-2 text-2xl md:text-3xl lg:text-4xl">
              Powered by <span className="text-primary">BinaryPie</span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Welcome to SwapHubu — the smarter way to trade your crypto.
            We&apos;ve combined the security of regulated financial
            infrastructure with the simplicity of personalized service.
          </p>

          {/* CTA Button */}
          {/* <div className="flex justify-center">
            <Link
              href="#learn-more"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-md transition-all duration-300"
            >
              Start Exchanging
            </Link>
          </div> */}
        </div>
      </div>
    </section>
  );
};
