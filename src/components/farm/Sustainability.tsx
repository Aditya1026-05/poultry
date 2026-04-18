import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Recycle, Sun, Wind } from "lucide-react";
import Reveal from "./Reveal";
import gallery3 from "@/assets/gallery-3.jpg";

const pillars = [
  { icon: Sun, title: "Solar-powered", desc: "100% of daytime energy from on-site renewables." },
  { icon: Recycle, title: "Zero waste", desc: "Composted manure feeds neighboring organic farms." },
  { icon: Wind, title: "Clean air", desc: "Bio-filters keep ammonia levels below 5 ppm." },
];

export default function Sustainability() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="sustainability" ref={ref} className="relative py-32 md:py-40 overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <img src={gallery3} alt="" className="w-full h-full object-cover opacity-25" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      </motion.div>

      <div className="container">
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-5">Sustainability</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-display leading-[1.05]">
              A farm the earth
              <br />
              would <span className="text-gradient-leaf italic">design itself</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              From clean energy to closed-loop waste, every system we build asks: would nature do it this way?
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12}>
              <div className="rounded-2xl glass p-8 h-full hover:bg-foreground/5 transition-colors">
                <span className="w-12 h-12 rounded-xl bg-gradient-leaf flex items-center justify-center mb-6">
                  <p.icon className="w-5 h-5 text-foreground" />
                </span>
                <h3 className="font-display text-2xl mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
