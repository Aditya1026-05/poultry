import Counter from "./Counter";
import Reveal from "./Reveal";

const stats = [
  { to: 12, suffix: "M+", label: "Eggs produced this year" },
  { to: 99, suffix: "%", label: "Healthy birds rate" },
  { to: 38, suffix: "%", label: "Higher farm efficiency" },
  { to: 24, suffix: "+", label: "Export-quality countries" },
];

export default function Stats() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container">
        <div className="rounded-[2rem] glass-strong shadow-soft px-6 py-14 md:px-14 md:py-20 noise overflow-hidden relative">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-radial-gold pointer-events-none" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 relative">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <div>
                  <div className="text-5xl md:text-6xl font-display text-gradient-gold leading-none">
                    <Counter to={s.to} suffix={s.suffix} />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground max-w-[180px]">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
