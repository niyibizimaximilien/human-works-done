import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  HeroSection,
  HowItWorksSection,
  FeaturesSection,
  StorePreviewSection,
  EarnSection,
  CTASection,
} from "@/components/LandingSections";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StorePreviewSection />
        <EarnSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
