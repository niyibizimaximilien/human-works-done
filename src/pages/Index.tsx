import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import {
  HeroSection,
  HowItWorksSection,
  WhatYouGetSection,
  TrustSection,
  CTASection,
} from "@/components/LandingSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhatYouGetSection />
        <Testimonials />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
