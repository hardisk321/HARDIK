import React, { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TECHS = ["Barcode", "RFID", "QR Code", "NFC", "OCR", "IoT Data", "Barcode Labels", "Label Printers", "Thermal Transfer Ribbons", "Not sure — advise me"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", interested_in: "", message: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  // Prefill interest when user comes from catalog detail drawer
  useEffect(() => {
    const prefill = window.sessionStorage.getItem("drishti_prefill_interest");
    if (prefill) {
      setForm((f) => ({
        ...f,
        interested_in: TECHS.includes(prefill) ? prefill : "Not sure — advise me",
        message: `I'd like a quote for: ${prefill}.\n\n`,
      }));
      window.sessionStorage.removeItem("drishti_prefill_interest");
      // scroll into view so user sees the prefilled form
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => { if (payload[k] === "") delete payload[k]; });
      await axios.post(`${API}/inquiries`, payload);
      setStatus({ loading: false, success: true, error: null });
      setForm({ name: "", email: "", phone: "", company: "", interested_in: "", message: "" });
      toast.success("Inquiry received — we'll be in touch within one business day.");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Something went wrong.";
      const errText = Array.isArray(msg) ? msg.map((m) => m.msg).join(", ") : msg;
      setStatus({ loading: false, success: false, error: errText });
      toast.error(errText);
    }
  };

  const inputCls = "w-full bg-white border border-[#00264d]/15 px-4 py-3 text-[15px] text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 transition-all rounded-sm";
  const labelCls = "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#00264d]/60 mb-2";

  return (
    <section id="contact" data-testid="contact-section" className="bg-white py-24 sm:py-32 border-t border-[#00264d]/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left intro */}
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">GET IN TOUCH</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#00264d] tracking-tight leading-[1.05]">
              Tell us what you&apos;re trying to track.
            </h2>
            <p className="mt-5 text-[#4A5568] text-lg leading-relaxed">
              Share a few details about your operation and a DRISHTI solution architect will get back to you within one business day with a tailored AIDC proposal.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: Mail, label: "Email", value: "info@drishti-aidc.com" },
                { icon: Phone, label: "Phone", value: "+91 98XXX XXXXX" },
                { icon: MapPin, label: "Headquarters", value: "Bengaluru, India" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-start gap-4" data-testid={`contact-info-${c.label.toLowerCase()}`}>
                    <div className="w-10 h-10 flex items-center justify-center bg-[#00264d] rounded-sm shrink-0">
                      <Icon className="w-4 h-4 text-[#00ccff]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0099bb]">{c.label}</div>
                      <div className="font-display text-base font-semibold text-[#00264d] mt-0.5">{c.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={submit}
              data-testid="contact-form"
              className="bg-[#F8FAFC] border border-[#00264d]/10 p-8 sm:p-10 rounded-sm"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls} htmlFor="name">Full name *</label>
                  <input id="name" required minLength={2} value={form.name} onChange={update("name")} placeholder="Jane Doe" className={inputCls} data-testid="form-input-name" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="email">Work email *</label>
                  <input id="email" type="email" required value={form.email} onChange={update("email")} placeholder="jane@company.com" className={inputCls} data-testid="form-input-email" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="phone">Phone</label>
                  <input id="phone" value={form.phone} onChange={update("phone")} placeholder="+91 98XXX XXXXX" className={inputCls} data-testid="form-input-phone" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="company">Company</label>
                  <input id="company" value={form.company} onChange={update("company")} placeholder="Acme Logistics Pvt Ltd" className={inputCls} data-testid="form-input-company" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="interested_in">Interested in</label>
                  <select id="interested_in" value={form.interested_in} onChange={update("interested_in")} className={inputCls} data-testid="form-input-interested">
                    <option value="">Select a technology…</option>
                    {TECHS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="message">Tell us about your project *</label>
                  <textarea id="message" required minLength={5} value={form.message} onChange={update("message")} rows={5} placeholder="We run 4 DCs and want to move from barcode to RFID at the carton level…" className={`${inputCls} resize-y`} data-testid="form-input-message" />
                </div>
              </div>

              {status.error && (
                <div className="mt-5 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-sm" data-testid="form-error">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              {status.success && (
                <div className="mt-5 flex items-start gap-2 text-sm text-[#003a7a] bg-[#E0F7FF] border border-[#00ccff]/40 px-4 py-3 rounded-sm" data-testid="form-success">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#0099bb]" />
                  <span>Thanks — your inquiry has been logged. Our team will reach out shortly.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status.loading}
                data-testid="form-submit-button"
                className="mt-7 group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00264d] hover:bg-[#003a7a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-7 py-3.5 rounded-sm transition-colors"
              >
                {status.loading ? "Sending…" : "Send Inquiry"}
                {!status.loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />}
              </button>

              <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/50">
                Your details stay private. We respond within 1 business day.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
