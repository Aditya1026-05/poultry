import Navbar from "@/components/farm/Navbar";
import Hero from "@/components/farm/Hero";
import About from "@/components/farm/About";
import Contact from "@/components/farm/Contact";
import Footer from "@/components/farm/Footer";

const Index = () => {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <About />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
