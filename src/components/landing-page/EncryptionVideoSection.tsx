import React from "react";
import { LogoWithGlow } from "@/components/common/logo-with-glow";

export const EncryptionVideoSection = () => {
  return (
    <section
      className="py-20 bg-transparent flex items-center justify-center md:min-h-[60vh] md:max-h-[80vh]"
      id="encryption-video"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative flex justify-center items-center">
          <video
            src="/assets/encryption.webm"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <LogoWithGlow size="md" className="opacity-70" />
          </div>
        </div>
      </div>
    </section>
  );
};
