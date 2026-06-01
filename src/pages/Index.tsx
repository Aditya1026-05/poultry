import Navbar from "@/components/farm/Navbar";
import Hero from "@/components/farm/Hero";
import About from "@/components/farm/About";
import Features from "@/components/farm/Features";
import Stats from "@/components/farm/Stats";
import Contact from "@/components/farm/Contact";
import Footer from "@/components/farm/Footer";

const Index = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Stats />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
