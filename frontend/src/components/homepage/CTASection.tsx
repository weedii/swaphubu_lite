import React from "react";
import { Button } from "../ui/button";
import { FadeIn } from "../ui/animated";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="container mx-auto px-4 text-center">
        <FadeIn>
          <h2 className="mb-4">Ready to Start Exchanging?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join SwapHubu today and experience the easiest way to exchange fiat
            to crypto. No complex verification, just simple and secure
            exchanges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Create Free Account</Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CTASection;
