import React from "react";
import { Tag, Printer, Layers, Award, ArrowRight } from "lucide-react";

const PRODUCTS = [
  {
    icon: Tag,
    code: "P-01",
    title: "Barcode Labels",
    desc: "Pre-printed and blank labels in every face-stock — paper, polyester, polypropylene, void and tamper-evident — die-cut to your spec.",
    chips: ["Thermal Transfer", "Direct Thermal", "Polyester", "Void Tamper", "Jewelry Tags", "Cold-chain"],
  },
  {
    icon: Printer,
    code: "P-02",
    title: "Barcode Label Printers",
    desc: "Desktop, industrial and mobile printers from leading global OEMs — sized from 4-inch to 8-inch, 203 to 600 dpi.",
    chips: ["Zebra", "TSC", "Honeywell", "Sato", "Postek", "Epson"],
  },
  {
    icon: Layers,
    code: "P-03",
    title: "Thermal Transfer Ribbons",
    desc: "Genuine wax, wax-resin and full resin ribbons matched to your face-stock and end-use — abrasion, chemical and heat resistant grades stocked.",
    chips: ["Wax", "Wax-Resin", "Full Resin", "Near-Edge", "Flat-Head", "Custom Widths"],
  },
];

const STATS = [
  { v: "08+", l: "Years Selling AIDC Consumables" },
  { v: "500+", l: "SKUs Stocked" },
  { v: "48 hr", l: "Pan-India Dispatch" },
  { v: "100%", l: "OEM Authentic" },
];

export default function Products() {
  return (
    <section
      id="products"
      data-testid="products-section"
      className="relative bg-white py-24 sm:py-32 border-t border-[#00264d]/10"
    >
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 mb-5 border border-[#00ccff]/40 bg-[#E0F7FF] px-3 py-1.5 rounded-full">
              <Award className="w-3.5 h-3.5 text-[#0099bb]" strokeWidth={2} />
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#0099bb] font-semibold">
                8+ YEARS · CONSUMABLES &amp; HARDWARE MASTERY
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#00264d] tracking-tight leading-[1.05]">
              Labels, Printers<br />&amp; Ribbons.
              <span className="text-[#0099bb]"> Stocked. Matched. Dispatched.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[#4A5568] text-lg leading-relaxed">
              Eight years and counting — DRISHTI is the trusted source for barcode labels, label printers and thermal transfer ribbons across India. We don&apos;t just sell consumables; we engineer the right combination for your application, your environment and your budget.
            </p>
          </div>
        </div>

        {/* Product cards — asymmetric */}
        <div className="grid lg:grid-cols-3 gap-px bg-[#00264d]/10 border border-[#00264d]/10 mb-16">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                data-testid={`product-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="group relative bg-white p-8 lg:p-10 hover:bg-[#F8FAFC] transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-7">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#00264d] group-hover:bg-[#00ccff] transition-colors duration-300 rounded-sm">
                    <Icon className="w-7 h-7 text-white group-hover:text-[#00264d] transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-xs tracking-[0.22em] text-[#00264d]/40">{p.code}</span>
                </div>

                <h3 className="font-display text-2xl lg:text-[26px] font-semibold text-[#00264d] mb-3 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-[#4A5568] text-[15px] leading-relaxed mb-6">{p.desc}</p>

                <div className="flex flex-wrap gap-1.5">
                  {p.chips.map((c) => (
                    <span
                      key={c}
                      className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[#00264d]/15 px-2.5 py-1 text-[#003a7a] group-hover:border-[#0099bb]/40 group-hover:text-[#0099bb] transition-colors rounded-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="mt-7 pt-5 border-t border-dashed border-[#00264d]/15">
                  <a
                    href="#contact"
                    data-testid={`product-cta-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase text-[#0099bb] hover:text-[#00264d] transition-colors"
                  >
                    Request stock list
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats strip */}
        <div className="bg-[#00264d] text-white p-8 sm:p-10 lg:p-12 rounded-sm relative overflow-hidden">
          <div className="absolute inset-0 grid-bg-dark opacity-40 pointer-events-none" />
          <div className="absolute -right-32 -top-32 w-80 h-80 rounded-full bg-[#00ccff]/15 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="font-mono text-[11px] tracking-[0.28em] text-[#00ccff] font-semibold mb-3">
                THE NUMBERS BEHIND THE EXPERIENCE
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.15]">
                Eight years of getting the right ribbon onto the right printer for the right label.
              </h3>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div
                  key={s.l}
                  data-testid={`product-stat-${s.l.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="border-l-2 border-[#00ccff] pl-4"
                >
                  <div className="font-display text-3xl lg:text-4xl font-bold">{s.v}</div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase mt-1.5 leading-snug">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-white/70 text-sm max-w-xl">
              Not sure which combination fits your application? Send us your label spec, printer model and use-case — we&apos;ll recommend the optimal ribbon and stock pairing within one business day.
            </p>
            <a
              href="#contact"
              data-testid="products-quote-cta"
              className="group inline-flex items-center gap-2 bg-[#00ccff] hover:bg-white text-[#00264d] text-sm font-semibold px-6 py-3 rounded-sm transition-colors shrink-0"
            >
              Get Pricing
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
