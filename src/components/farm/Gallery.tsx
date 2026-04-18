import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Reveal from "./Reveal";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const images = [
  { src: g1, alt: "Free-range chickens at golden hour", span: "row-span-2" },
  { src: g2, alt: "Fresh organic brown eggs in a basket", span: "" },
  { src: g6, alt: "Aerial view of a sustainable poultry farm", span: "" },
  { src: g4, alt: "Portrait of a majestic rooster", span: "row-span-2" },
  { src: g5, alt: "Baby chicks huddled together", span: "" },
  { src: g3, alt: "Modern poultry farm at dusk", span: "" },
];

export default function Gallery() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="gallery" className="relative py-32 md:py-40">
      <div className="container">
        <div className="max-w-2xl mb-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-5">Gallery</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-display leading-[1.05]">
              Life at the <span className="text-gradient-gold italic">farm</span>.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[260px] gap-4">
          {images.map((img, i) => (
            <Reveal key={img.src} delay={i * 0.05} className={img.span}>
              <button
                onClick={() => setActive(img.src)}
                className={`group relative w-full h-full rounded-2xl overflow-hidden glass shadow-soft ${img.span ? "min-h-full" : ""}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                <span className="absolute bottom-4 left-4 right-4 text-left text-sm text-foreground/90 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  {img.alt}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex items-center justify-center p-6 cursor-zoom-out"
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <motion.img
              key={active}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              src={active}
              alt=""
              className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-leaf"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
