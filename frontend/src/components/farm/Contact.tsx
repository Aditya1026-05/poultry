import { useState, FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Reveal from "./Reveal";
import { toast } from "sonner";
import gallery1 from "@/assets/gallery-1.jpg";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to submit message. Please try again.");
      }

      toast.success("Message sent! We have received your inquiry and will be in touch within 24 hours.");
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please contact us directly via email.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact" className="relative py-16 sm:py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={gallery1} alt="" className="w-full h-full object-cover opacity-25 blur-2xl scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4 sm:mb-5">Contact</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-display leading-[1.15] tracking-normal break-words">
              Let's grow{" "}
              <span className="text-gradient-gold italic">something better</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              Partner with us, source from us, or come visit the farm. Drop a line and we'll respond within a day.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 sm:mt-10 space-y-3 text-sm text-muted-foreground">
              <p>
                <a href="mailto:startpoultrybarnala@gmail.com" className="text-foreground font-medium hover:text-accent transition-colors">
                  startpoultrybarnala@gmail.com
                </a>{" "}
                — inquiries & support
              </p>
              <p>
                <a href="mailto:adityatayal2610@gmail.com" className="text-foreground font-medium hover:text-accent transition-colors">
                  adityatayal2610@gmail.com
                </a>{" "}
                — general inquiries
              </p>
              <p>
                <a href="tel:+918847660891" className="text-foreground font-medium hover:text-accent transition-colors">
                  +91 8847660891
                </a>{" "}
                — sales & partnerships
              </p>
              <p>Near Indian oil Petrol Station, Barnala Road</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <form onSubmit={onSubmit} className="rounded-[2rem] glass-strong p-6 sm:p-8 md:p-10 shadow-leaf space-y-5 sm:space-y-6">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-border focus:border-accent outline-none px-1 pt-6 pb-2 text-foreground transition-colors"
              />
              <label
                htmlFor="name"
                className="absolute left-1 top-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:uppercase peer-focus:text-accent"
              >
                Your name
              </label>
            </div>

            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-border focus:border-accent outline-none px-1 pt-6 pb-2 text-foreground transition-colors"
              />
              <label
                htmlFor="email"
                className="absolute left-1 top-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:uppercase peer-focus:text-accent"
              >
                Email address
              </label>
            </div>

            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-border focus:border-accent outline-none px-1 pt-6 pb-2 text-foreground transition-colors resize-none"
              />
              <label
                htmlFor="message"
                className="absolute left-1 top-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-xs peer-focus:tracking-[0.2em] peer-focus:uppercase peer-focus:text-accent"
              >
                Tell us a little
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center justify-center w-full sm:w-auto gap-2 px-7 py-3.5 sm:py-4 rounded-full bg-gradient-gold text-accent-foreground font-medium shadow-glow hover:shadow-leaf transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending message...
                </>
              ) : (
                <>
                  Send message
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
