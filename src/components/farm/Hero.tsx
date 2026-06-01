import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRef, lazy, Suspense } from "react";

const FarmScene = lazy(() => import("./FarmScene"));

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} id="top" className="relative min-h-screen overflow-hidden noise">
      {/* 3D scene */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-hero" />}>
          <FarmScene />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none" />
      </motion.div>

      {/* Copy */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 container min-h-screen flex flex-col justify-center pt-32 pb-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full glass text-xs uppercase tracking-[0.2em] text-accent"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The future of poultry
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.08] tracking-normal break-words"
        >
          Clean and Healthy{" "}
          <span className="text-gradient-gold">Poultry Farming</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground"
        >
          Sustainable. Efficient. Intelligent. We blend nature with technology to grow healthier birds and a healthier planet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#about"
            className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gradient-gold text-accent-foreground font-medium shadow-glow hover:shadow-leaf transition-all duration-500 hover:-translate-y-0.5"
          >
            Explore Farm
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full glass text-foreground hover:bg-foreground/10 transition-colors"
          >
            Get Started
          </a>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Scroll
          <span className="w-px h-12 bg-gradient-to-b from-accent to-transparent animate-pulse-glow" />
        </motion.div>
      </motion.div>
    </section>
  );
}
