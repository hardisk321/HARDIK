import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { DrishtiMark, DrishtiWordmark } from "./Logo";

const NAV = [
  { label: "Solutions", href: "#solutions" },
  { label: "Products", href: "#products" },
  { label: "Industries", href: "#industries" },
  { label: "Why Drishti", href: "#why" },
  { label: "About", href: "#about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-white/85 border-b border-[#00264d]/10" : "bg-white/40 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <a href="#top" data-testid="logo-link" className="flex items-center gap-3">
            <DrishtiMark size={44} />
            <DrishtiWordmark size="md" showTagline={false} />
          </a>

          <nav className="hidden lg:flex items-center gap-9" data-testid="primary-nav">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="link-underline text-sm font-medium text-[#00264d]/80 hover:text-[#00264d] transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#contact"
              data-testid="header-cta"
              className="group inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors"
            >
              Get a Quote
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            data-testid="mobile-menu-toggle"
            aria-label="Toggle menu"
            className="lg:hidden p-2 -mr-2 text-[#00264d]"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#00264d]/10 bg-white" data-testid="mobile-nav">
          <div className="px-6 py-6 flex flex-col gap-4">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-base font-medium text-[#00264d]"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              data-testid="mobile-header-cta"
              className="mt-2 inline-flex items-center justify-center gap-2 bg-[#00264d] text-white text-sm font-semibold px-5 py-3 rounded-sm"
            >
              Get a Quote
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
