import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Egg, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["hsla(145, 25%, 6%, 0)", "hsla(145, 25%, 6%, 0.85)"]);
  const blur = useTransform(scrollY, [0, 120], ["blur(0px)", "blur(18px)"]);
  const border = useTransform(scrollY, [0, 120], ["hsla(40,30%,94%,0)", "hsla(40,30%,94%,0.08)"]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <motion.header
      style={{ background: bg, backdropFilter: blur as unknown as string, borderBottom: "1px solid", borderColor: border }}
      className="fixed top-0 inset-x-0 z-50 transition-colors"
    >
      <nav className="container flex items-center justify-between py-4 md:py-5">
        <a href="#top" onClick={closeMenu} className="flex items-center gap-2 group">
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-gold shadow-glow">
            <Egg className="w-4 h-4 text-accent-foreground" />
          </span>
          <span className="font-display text-xl tracking-tight">Star Poultry</span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {user?.role === "admin" && (
            <li>
              <Link to="/admin/alerts" className="relative hover:text-foreground transition-colors font-semibold text-amber-500">
                Alerts 🔔
              </Link>
            </li>
          )}
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="relative hover:text-foreground transition-colors">
                {l.label}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-accent scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
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

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to={user ? "/order" : "/auth?mode=signup"}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-gold text-accent-foreground shadow-glow"
          >
            Order
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-xl glass text-foreground hover:bg-foreground/10 transition-colors focus:outline-none"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden glass-strong border-b border-border/60 overflow-hidden"
          >
            <div className="container py-6 flex flex-col gap-4">
              {user?.role === "admin" && (
                <Link
                  to="/admin/alerts"
                  onClick={closeMenu}
                  className="px-3 py-2 rounded-lg hover:bg-foreground/5 text-amber-500 font-semibold flex items-center justify-between"
                >
                  <span>Alerts</span>
                  <span>🔔</span>
                </Link>
              )}
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="px-3 py-2 rounded-lg text-base text-foreground/90 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  {l.label}
                </a>
              ))}

              <div className="pt-3 border-t border-border/40 flex flex-col gap-2.5">
                {user ? (
                  <>
                    <Link
                      to={user.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={closeMenu}
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium glass hover:bg-foreground/5 transition-colors"
                    >
                      {user.role === "admin" ? "Admin Portal" : "Customer Dashboard"}
                    </Link>
                    <Link
                      to="/order"
                      onClick={closeMenu}
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-gold text-accent-foreground shadow-glow"
                    >
                      Order Eggs Now
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={closeMenu}
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium glass hover:bg-foreground/5 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth?mode=signup"
                      onClick={closeMenu}
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-gold text-accent-foreground shadow-glow"
                    >
                      Order Eggs (Register)
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
