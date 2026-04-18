import { useState, FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { toast } from "sonner";
import gallery1 from "@/assets/gallery-1.jpg";

function Field({ id, label, type = "text", as = "input" }: { id: string; label: string; type?: string; as?: "input" | "textarea" }) {
  const [val, setVal] = useState("");
  const Comp = as as "input";
  return (
    <div className="relative">
      <Comp
        id={id}
        name={id}
        type={type}
        rows={as === "textarea" ? 4 : undefined as never}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder=" "
        className="peer w-full bg-transparent border-b border-border focus:border-accent outline-none px-1 pt-6 pb-2 text-foreground transition-colors resize-none"
      />
      <label
        htmlFor={id}
        className="absolute left-1 top-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:uppercase peer-focus:text-accent"
      >
        {label}
      </label>
    </div>
  );
}

export default function Contact() {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Thanks — we'll be in touch within 24 hours.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="relative py-32 md:py-40 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={gallery1} alt="" className="w-full h-full object-cover opacity-25 blur-2xl scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="container grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-5">Contact</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-display leading-[1.05]">
              Let's grow
              <br />
              <span className="text-gradient-gold italic">something better</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Partner with us, source from us, or come visit the farm. Drop a line and we'll respond within a day.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 space-y-3 text-sm text-muted-foreground">
              <p><span className="text-foreground">hello@aviora.farm</span> — general inquiries</p>
              <p><span className="text-foreground">+1 (555) 020-3344</span> — sales & partnerships</p>
              <p>Aviora Farm, Verdant Valley, OR 97000</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <form onSubmit={onSubmit} className="rounded-[2rem] glass-strong p-8 md:p-10 shadow-leaf space-y-6">
            <Field id="name" label="Your name" />
            <Field id="email" label="Email address" type="email" />
            <Field id="message" label="Tell us a little" as="textarea" />
            <button
              type="submit"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gradient-gold text-accent-foreground font-medium shadow-glow hover:shadow-leaf transition-all hover:-translate-y-0.5"
            >
              Send message
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
