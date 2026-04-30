import React from "react";
import { Barcode, Radio, QrCode, Wifi, ScanText, Boxes } from "lucide-react";

const SOLUTIONS = [
  {
    icon: Barcode,
    title: "Barcode Solutions",
    code: "01",
    desc: "1D & 2D barcode generation, printing and scanning across retail POS, asset tagging, inventory and logistics workflows.",
    points: ["Code 128, EAN, UPC, GS1", "Industrial label printers", "Mobile scanner integration"],
  },
  {
    icon: Radio,
    title: "RFID Systems",
    code: "02",
    desc: "Passive & active UHF/HF RFID with handheld and fixed readers, smart shelves, and gateway portals for bulk capture.",
    points: ["UHF / HF / LF tags", "Fixed & handheld readers", "Real-time location"],
  },
  {
    icon: QrCode,
    title: "QR Code Platform",
    code: "03",
    desc: "Dynamic QR generation, scan analytics, brand protection and authentication for traceability and consumer engagement.",
    points: ["Dynamic & static QR", "Scan analytics", "Anti-counterfeit"],
  },
  {
    icon: Wifi,
    title: "NFC Tag Solutions",
    code: "04",
    desc: "NTAG, DESFire and EM tags for access control, asset checkpoints, smart packaging and tap-to-action experiences.",
    points: ["NTAG 213/215/216", "DESFire EV2/EV3", "Custom encoding"],
  },
  {
    icon: ScanText,
    title: "OCR & Vision",
    code: "05",
    desc: "Optical character recognition for documents, license plates, expiry codes, MRP/batch and serial number capture.",
    points: ["MRP & batch capture", "ANPR / LPR", "Document AI"],
  },
  {
    icon: Boxes,
    title: "IoT Data Capture",
    code: "06",
    desc: "Sensor fusion, gateways and dashboards that turn captured identifiers into live operational intelligence.",
    points: ["Sensor & gateway integration", "Live dashboards", "API & ERP connectors"],
  },
];

export default function Solutions() {
  return (
    <section id="solutions" data-testid="solutions-section" className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">SOLUTIONS · 06</div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#00264d] tracking-tight leading-[1.05]">
              The full AIDC<br />stack — under one roof.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[#4A5568] text-lg leading-relaxed">
              From the first scanned label to the boardroom dashboard, DRISHTI engineers every layer of automatic identification and data capture — hardware, middleware, software and SLA-backed support.
            </p>
          </div>
        </div>

        {/* Technical grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#00264d]/10">
          {SOLUTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                data-testid={`solution-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="group relative border-r border-b border-[#00264d]/10 p-8 lg:p-10 bg-white hover:bg-[#F8FAFC] transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#00264d] group-hover:bg-[#00ccff] transition-colors duration-300 rounded-sm">
                    <Icon className="w-6 h-6 text-white group-hover:text-[#00264d] transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-xs tracking-[0.22em] text-[#00264d]/40">{s.code}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#00264d] mb-3 tracking-tight">{s.title}</h3>
                <p className="text-[#4A5568] text-[15px] leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-[#00264d]/80">
                      <span className="w-3 h-px bg-[#0099bb]" />
                      <span className="font-mono text-[12px] tracking-wide">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
