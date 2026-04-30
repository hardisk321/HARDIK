import React from "react";
import { Cog, Headphones, Zap, Lock, BarChart3, Globe2 } from "lucide-react";

const FEATURES = [
  { icon: Cog, title: "End-to-end engineering", desc: "Hardware, middleware, software and ERP integration delivered by one accountable team." },
  { icon: Headphones, title: "24×7 field support", desc: "Pan-India service desks with on-site SLAs as low as 4 hours for mission-critical sites." },
  { icon: Zap, title: "Sub-second capture", desc: "Optimised pipelines and edge processing — every scan is logged in under 700 ms." },
  { icon: Lock, title: "Enterprise security", desc: "TLS, role-based access, audit trails and ISO 27001-aligned operating procedures." },
  { icon: BarChart3, title: "Live operational intel", desc: "Dashboards and ERP/SCM connectors that turn data captured into decisions made." },
  { icon: Globe2, title: "Scale without friction", desc: "From a single warehouse to multi-country rollouts — same SDK, same SLA, same team." },
];

export default function WhyDrishti() {
  return (
    <section id="why" data-testid="why-section" className="bg-[#00264d] text-white py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg-dark pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#00ccff]/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-6">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#00ccff] font-semibold mb-4">WHY DRISHTI</div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Engineered for operators<br />
              who can&apos;t afford a missed scan.
            </h2>
          </div>
          <p className="lg:col-span-5 lg:col-start-8 text-white/70 text-lg leading-relaxed">
            For more than a decade we&apos;ve deployed AIDC across the busiest supply chains in the country — quietly, reliably and at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                data-testid={`feature-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="bg-[#00264d] p-8 lg:p-10 hover:bg-[#003a7a] transition-colors duration-300 group"
              >
                <div className="w-11 h-11 flex items-center justify-center border border-[#00ccff]/40 group-hover:border-[#00ccff] group-hover:bg-[#00ccff]/10 transition-colors mb-6 rounded-sm">
                  <Icon className="w-5 h-5 text-[#00ccff]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" data-testid="about-section" className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">ABOUT DRISHTI</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#00264d] tracking-tight leading-[1.05]">
              We turn what gets scanned<br />into what gets known.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-5 text-[#4A5568] text-lg leading-relaxed">
            <p>
              <strong className="text-[#00264d] font-semibold">DRISHTI</strong> — a Sanskrit word meaning <em>vision</em> — was founded to bring true visibility to physical operations. We build, deploy and support the full AIDC stack so that every box, asset, document or patient is identified, tracked and accounted for in real time.
            </p>
            <p>
              Our customers run distribution centres that never sleep, factories that can&apos;t afford downtime and hospitals that can&apos;t afford errors. We exist to make sure their data is captured the first time, every time.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#00264d]/10">
              {[
                { v: "12+", l: "Years in AIDC" },
                { v: "150+", l: "Enterprise rollouts" },
                { v: "9", l: "Industries served" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-bold text-[#00264d]">{s.v}</div>
                  <div className="font-mono text-[11px] tracking-[0.18em] text-[#0099bb] uppercase mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
