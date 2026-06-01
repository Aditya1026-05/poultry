import { motion, useScroll, useTransform } from "framer-motion";
import { Egg } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["hsla(145, 25%, 6%, 0)", "hsla(145, 25%, 6%, 0.7)"]);
  const blur = useTransform(scrollY, [0, 120], ["blur(0px)", "blur(18px)"]);
  const border = useTransform(scrollY, [0, 120], ["hsla(40,30%,94%,0)", "hsla(40,30%,94%,0.08)"]);

  return (
    <motion.header
      style={{ background: bg, backdropFilter: blur as unknown as string, borderBottom: "1px solid", borderColor: border }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <nav className="container flex items-center justify-between py-5">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-gold shadow-glow">
            <Egg className="w-4 h-4 text-accent-foreground" />
          </span>
          <span className="font-display text-xl tracking-tight">Star Poultry</span>
        </a>
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="relative hover:text-foreground transition-colors">
                {l.label}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-accent scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="px-4 py-2 rounded-full text-sm font-medium glass hover:bg-foreground/5 transition-colors"
              >
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <Link
                to="/order"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-gold text-accent-foreground shadow-glow hover:opacity-90 transition-opacity"
              >
                Order Eggs
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full text-sm font-medium glass hover:bg-foreground/5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-gold text-accent-foreground shadow-glow hover:opacity-90 transition-opacity"
              >
                Order Eggs
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
