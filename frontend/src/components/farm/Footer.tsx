import { Egg } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-10 sm:py-12 mt-8 sm:mt-10">
      <div className="container flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-muted-foreground text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center">
              <Egg className="w-3.5 h-3.5 text-accent-foreground" />
            </span>
            <span className="font-display text-base text-foreground">Star Poultry</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <span>© {new Date().getFullYear()} — Smart poultry, gentle planet.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
