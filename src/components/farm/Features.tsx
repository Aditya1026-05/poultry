import { useRef } from "react";
import { Activity, Droplets, Thermometer, Sprout } from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    icon: Droplets,
    title: "Smart Feeding",
    desc: "Automated nutrition tailored to each flock's age, activity, and health profile.",
  },
  {
    icon: Activity,
    title: "Disease Monitoring",
    desc: "Computer vision and biosensors flag anomalies before they become outbreaks.",
  },
  {
    icon: Thermometer,
    title: "Climate Control",
    desc: "Adaptive ventilation and humidity tuning for ideal welfare year-round.",
  },
  {
    icon: Sprout,
    title: "Organic Farming",
    desc: "Pesticide-free pastures and certified organic feed from local growers.",
  },
];

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="group relative h-full rounded-2xl glass p-8 transition-[transform,box-shadow] duration-500 hover:shadow-leaf overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), hsl(var(--accent) / 0.18), transparent 50%)",
      }}
    >
      {children}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-32 md:py-40">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-5">What we do</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-display leading-[1.05]">
              Tools that quietly do the
              <span className="text-gradient-gold italic"> heavy lifting</span>.
            </h2>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <TiltCard>
                <div className="flex flex-col h-full">
                  <span className="w-12 h-12 rounded-xl bg-gradient-leaf flex items-center justify-center shadow-leaf mb-6 group-hover:scale-110 transition-transform duration-500">
                    <f.icon className="w-5 h-5 text-foreground" />
                  </span>
                  <h3 className="font-display text-2xl mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  <span className="mt-6 text-xs uppercase tracking-[0.25em] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more →
                  </span>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
