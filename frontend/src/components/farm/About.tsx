import { lazy, Suspense } from "react";
import Reveal from "./Reveal";
import { Cpu, Leaf, ShieldCheck } from "lucide-react";

const EggModel = lazy(() => import("./EggModel"));

const points = [
  { icon: Cpu, title: "Constant monitoring", desc: "Constant health, behavior, and growth analytics for all birds." },
  { icon: Leaf, title: "Natural living", desc: "Free-range pastures, organic feed, and stress-free environments." },
  { icon: ShieldCheck, title: "Trusted quality", desc: "Traceable from coop to kitchen with verified certifications." },
];

export default function About() {
  return (
    <section id="about" className="relative py-16 sm:py-24 md:py-36 noise">
      <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4 sm:mb-5">About Star Poultry</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-display leading-[1.15] tracking-normal break-words">
              Where ancient craft meets{" "}
              <span className="text-gradient-leaf italic">modern intelligence</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              We've reimagined the poultry farm from the ground up — pairing decades of farming wisdom with sensors,
              AI, and renewable systems that respect the land and the animals on it.
            </p>
          </Reveal>

          <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-5">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={0.3 + i * 0.1}>
                <div className="flex gap-4 group">
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl glass flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <p.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl">{p.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 max-w-md">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.2}>
          <div className="relative aspect-square max-w-sm sm:max-w-md mx-auto lg:max-w-none w-full rounded-[2rem] glass-strong overflow-hidden shadow-leaf">
            <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none" />
            <Suspense fallback={null}>
              <EggModel />
            </Suspense>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Heritage</p>
                <p className="font-display text-xl sm:text-2xl">Free-range eggs</p>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full glass text-accent">Grade A+</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
