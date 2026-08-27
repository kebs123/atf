import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationProps {
  variant?: "default" | "dark";
}

const Navigation = ({ variant = "default" }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDarkBar = variant === "dark";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const overHero = !isDarkBar && !isScrolled;
  const lightOnDark = isMobileMenuOpen || isDarkBar || overHero;

  const handleAnchorClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/${href}`;
    }
  };

  const linkClass = `text-[11px] uppercase tracking-wider font-normal smooth-hover hover:opacity-60 ${
    lightOnDark ? "text-white" : "text-foreground"
  }`;

  const toggleClass = lightOnDark
    ? "text-white hover:bg-white/10 hover:text-white"
    : "";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ${
        isMobileMenuOpen
          ? "bg-foreground"
          : isDarkBar
            ? isScrolled
              ? "bg-foreground/95 backdrop-blur-lg shadow-soft"
              : "bg-foreground"
            : isScrolled
              ? "bg-card/95 backdrop-blur-lg shadow-soft"
              : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 py-5">
        <div className="flex items-center justify-between gap-4">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 cursor-pointer">
              <ShieldCheck className={`h-4 w-4 ${lightOnDark ? "text-white" : "text-primary"}`} />
              <span className={`text-sm font-normal tracking-wide ${lightOnDark ? "text-white" : "text-foreground"}`}>
                Vero
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleAnchorClick("#how-it-works")} className={linkClass}>
              How it works
            </button>
            <Link to="/verify" className={linkClass}>
              Verify
            </Link>
            <Link to="/report" className={linkClass}>
              Report
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle className={toggleClass} />
            <Link to="/signup">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full text-[11px] uppercase tracking-wider font-normal px-5 ${
                  lightOnDark
                    ? "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                    : ""
                }`}
              >
                Sign up
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="rounded-full text-[11px] uppercase tracking-wider font-normal px-5">
                Log in
              </Button>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle className={toggleClass} />
            <button
              className={lightOnDark ? "text-white" : "text-foreground"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={`md:hidden mt-6 pb-4 -mx-6 px-6 rounded-b-xl ${lightOnDark ? "bg-foreground" : "bg-card"}`}
            >
              <button onClick={() => handleAnchorClick("#how-it-works")} className={`block py-3 ${linkClass}`}>
                How it works
              </button>
              <Link to="/verify" className={`block py-3 ${linkClass}`} onClick={() => setIsMobileMenuOpen(false)}>
                Verify
              </Link>
              <Link to="/report" className={`block py-3 ${linkClass}`} onClick={() => setIsMobileMenuOpen(false)}>
                Report
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full mt-4 rounded-full text-[11px] uppercase tracking-wider font-normal px-5">
                  Sign up
                </Button>
              </Link>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full mt-3 rounded-full text-[11px] uppercase tracking-wider font-normal px-5">
                  Log in
                </Button>
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;
