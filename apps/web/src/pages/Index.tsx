import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Tagline from "@/components/Tagline";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <Hero />
      <Tagline />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
