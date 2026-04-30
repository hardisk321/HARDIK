import React from "react";
import { DrishtiMark } from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-testid="site-footer" className="bg-[#001A33] text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <DrishtiMark size={48} variant="dark" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-xl font-bold tracking-[0.18em] text-white">DRISHTI</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00ccff]">Auto ID Solution</span>
              </div>
            </div>
            <p className="mt-5 text-white/70 text-sm leading-relaxed max-w-md">
              DRISHTI is a full-stack AIDC company building barcode, RFID, QR, NFC and OCR solutions for enterprise operations.
            </p>
            <p className="mt-6 font-display italic text-lg text-[#00ccff]">&ldquo;Your Insight Into Data.&rdquo;</p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00ccff] mb-4">Solutions</div>
              <ul className="space-y-2.5 text-sm text-white/75">
                {["Barcode", "RFID", "QR Code", "NFC", "OCR", "IoT Data"].map((s) => (
                  <li key={s}><a href="#solutions" className="hover:text-[#00ccff] transition-colors" data-testid={`footer-solution-${s.toLowerCase().replace(/\s+/g, "-")}`}>{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00ccff] mb-4">Company</div>
              <ul className="space-y-2.5 text-sm text-white/75">
                <li><a href="#about" className="hover:text-[#00ccff] transition-colors" data-testid="footer-link-about">About</a></li>
                <li><a href="#industries" className="hover:text-[#00ccff] transition-colors" data-testid="footer-link-industries">Industries</a></li>
                <li><a href="#why" className="hover:text-[#00ccff] transition-colors" data-testid="footer-link-why">Why Drishti</a></li>
                <li><a href="#contact" className="hover:text-[#00ccff] transition-colors" data-testid="footer-link-contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00ccff] mb-4">Reach us</div>
              <ul className="space-y-2.5 text-sm text-white/75">
                <li>info@drishti-aidc.com</li>
                <li>+91 98XXX XXXXX</li>
                <li>Bengaluru, India</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/50">© {year} DRISHTI Auto ID Solution. All rights reserved.</p>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-white/50">AIDC · BARCODE · RFID · QR · NFC · OCR</p>
        </div>
      </div>
    </footer>
  );
}
