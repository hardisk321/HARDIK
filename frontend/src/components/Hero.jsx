import React from "react";
import { ArrowRight, ScanLine, ShieldCheck } from "lucide-react";
import { DrishtiMark } from "./Logo";

const TECHS = ["BARCODE", "RFID", "QR CODE", "NFC", "OCR", "IoT DATA", "BARCODE", "RFID", "QR CODE", "NFC", "OCR", "IoT DATA"];

export default function Hero() {
  return (
    <section id="top" data-testid="hero-section" className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full bg-[#00ccff]/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div className="lg:col-span-7 reveal">
            <div className="inline-flex items-center gap-2 mb-7 border border-[#00264d]/15 bg-white px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ccff] animate-pulse" />
              <span className="font-mono text-[11px] tracking-[0.22em] text-[#0099bb] font-semibold">AUTO-ID · DATA CAPTURE · IoT</span>
            </div>

            <h1 className="font-display font-bold text-[#00264d] text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Your Insight
              <br />
              <span className="relative inline-block">
                Into{" "}
                <span className="relative">
                  Data.
                  <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 320 14" fill="none">
                    <path d="M2 11C50 4 120 2 200 5C260 7 300 9 318 11" stroke="#00ccff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="mt-7 text-lg text-[#4A5568] max-w-xl leading-relaxed">
              DRISHTI delivers enterprise-grade <strong className="text-[#00264d] font-semibold">Automatic Identification &amp; Data Capture</strong> across barcode, RFID, QR, NFC and OCR — turning every scan into traceable, real-time intelligence.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                data-testid="hero-primary-cta"
                className="group inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] text-white text-sm font-semibold px-6 py-3.5 rounded-sm transition-colors"
              >
                Request a Demo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </a>
              <a
                href="#solutions"
                data-testid="hero-secondary-cta"
                className="inline-flex items-center gap-2 border border-[#00264d] text-[#00264d] text-sm font-semibold px-6 py-3.5 rounded-sm hover:bg-[#00264d] hover:text-white transition-colors"
              >
                Explore Solutions
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { v: "99.9%", l: "Scan Accuracy" },
                { v: "150+", l: "Enterprises" },
                { v: "24/7", l: "Field Support" },
              ].map((s) => (
                <div key={s.l} data-testid={`hero-stat-${s.l.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="font-display text-3xl font-bold text-[#00264d]">{s.v}</div>
                  <div className="font-mono text-[11px] tracking-[0.18em] text-[#0099bb] uppercase mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual */}
          <div className="lg:col-span-5 reveal" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              {/* Mock device frame */}
              <div className="relative bg-[#00264d] rounded-md p-6 shadow-2xl shadow-[#00264d]/20">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00ccff]" />
                    <span className="font-mono text-[10px] tracking-[0.22em] text-[#9fc8f0]">SCAN ENGINE · LIVE</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#9fc8f0]">v4.2.1</span>
                </div>

                <div className="bg-[#001A33] rounded-sm p-5 border border-white/5">
                  <DrishtiMark size={180} variant="dark" className="mx-auto" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-sm">
                    <div className="flex items-center gap-2 text-[#00ccff]">
                      <ScanLine className="w-4 h-4" strokeWidth={1.5} />
                      <span className="font-mono text-[10px] tracking-[0.18em]">SCANS / DAY</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-white mt-1">12.4M</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-sm">
                    <div className="flex items-center gap-2 text-[#00ccff]">
                      <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                      <span className="font-mono text-[10px] tracking-[0.18em]">UPTIME SLA</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-white mt-1">99.99%</div>
                  </div>
                </div>
              </div>

              {/* Floating tag */}
              <div className="absolute -bottom-5 -left-5 bg-white border border-[#00264d]/10 px-4 py-3 shadow-lg rounded-sm hidden sm:block">
                <div className="font-mono text-[10px] tracking-[0.18em] text-[#0099bb]">TRACEABILITY</div>
                <div className="font-display text-sm font-bold text-[#00264d]">End-to-end visibility</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech marquee */}
      <div className="relative border-t border-b border-[#00264d]/10 bg-[#F8FAFC] overflow-hidden py-5">
        <div className="flex marquee-track whitespace-nowrap">
          {[...TECHS, ...TECHS].map((t, i) => (
            <span key={i} className="font-mono text-sm tracking-[0.32em] text-[#00264d]/60 mx-12 inline-flex items-center gap-12">
              {t}
              <span className="w-1.5 h-1.5 bg-[#00ccff] rounded-full" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
