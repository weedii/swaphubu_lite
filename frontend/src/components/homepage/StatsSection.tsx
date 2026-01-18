import React from "react";
import { FadeIn, SlideUp } from "../ui/animated";

const StatsSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-screen-xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="mb-4">Trusted by the Community</h2>
            <p>
              Join thousands of satisfied users who trust SwapHubu for their
              crypto needs
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { value: "$250M+", label: "Total Volume Exchanged", delay: 0.1 },
            { value: "50K+", label: "Active Users", delay: 0.2 },
            { value: "150+", label: "Supported Countries", delay: 0.3 },
            { value: "99.9%", label: "Uptime Guarantee", delay: 0.4 },
          ].map((stat, index) => (
            <SlideUp key={index} delay={stat.delay}>
              <div className="text-center">
                <p>{stat.value}</p>
                <p>{stat.label}</p>
              </div>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
