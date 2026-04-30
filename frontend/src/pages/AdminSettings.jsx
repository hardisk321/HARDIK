import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Mail, Phone, MapPin, Building2, Clock, Bell, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import client, { auth, formatApiError } from "@/lib/api";
import { DrishtiMark } from "@/components/Logo";

const FIELDS = [
  { key: "company_name", label: "Company name", icon: Building2, type: "text", placeholder: "DRISHTI",
    help: "Shown in the header logo lockup and footer." },
  { key: "tagline", label: "Tagline", icon: null, type: "text", placeholder: "Your Insight Into Data.",
    help: "Italic line in the footer; not used in hero (hero is hand-set)." },
  { key: "contact_email", label: "Contact email", icon: Mail, type: "email", placeholder: "info@drishti-aidc.com",
    help: "Public-facing email shown on the contact section, footer, and 'Email us' buttons." },
  { key: "contact_phone", label: "Contact phone", icon: Phone, type: "tel", placeholder: "+91 98765 43210",
    help: "Public phone displayed on the contact section and footer." },
  { key: "address", label: "Address / Headquarters", icon: MapPin, type: "textarea", placeholder: "42 MG Road, Bengaluru 560001, India",
    help: "Full address — line breaks allowed." },
  { key: "business_hours", label: "Business hours", icon: Clock, type: "text", placeholder: "Mon–Sat · 9:30 AM – 6:30 PM IST",
    help: "Optional. Shown in the contact section if set." },
  { key: "notification_email", label: "Lead notification recipient", icon: Bell, type: "email", placeholder: "your-email@gmail.com",
    help: "Where 'new lead' emails are sent. Leave blank to skip notifications. (Activates once RESEND_API_KEY is configured in backend/.env.)" },
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [original, setOriginal] = useState(null);
  const [state, setState] = useState({ loading: true, saving: false, error: null, success: false });

  useEffect(() => {
    if (!auth.isAuthenticated()) { navigate("/admin/login", { replace: true }); return; }
    client.get("/admin/site-settings")
      .then((res) => { setForm(res.data); setOriginal(res.data); setState({ loading: false, saving: false, error: null, success: false }); })
      .catch((err) => { setState({ loading: false, saving: false, error: formatApiError(err), success: false }); });
  }, [navigate]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setState((s) => ({ ...s, success: false })); };

  const dirty = form && original && Object.keys(form).some((k) => form[k] !== original[k]);

  const submit = async (e) => {
    e.preventDefault();
    if (!dirty) return;
    setState((s) => ({ ...s, saving: true, error: null, success: false }));
    // Send only changed fields
    const payload = {};
    Object.keys(form).forEach((k) => { if (form[k] !== original[k]) payload[k] = form[k]; });
    try {
      const { data } = await client.put("/admin/site-settings", payload);
      setForm(data); setOriginal(data);
      setState({ loading: false, saving: false, error: null, success: true });
      toast.success("Site settings saved.");
    } catch (err) {
      const msg = formatApiError(err);
      setState({ loading: false, saving: false, error: msg, success: false });
      toast.error(msg);
    }
  };

  const reset = () => { if (original) setForm(original); setState((s) => ({ ...s, error: null, success: false })); };

  const inputCls = "w-full bg-white border border-[#00264d]/15 px-4 py-2.5 text-sm text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 transition-all rounded-sm";
  const labelCls = "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#00264d]/60 mb-2";

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="admin-settings-page">
      <header className="sticky top-0 z-40 bg-white border-b border-[#00264d]/10">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3" data-testid="admin-settings-back">
            <DrishtiMark size={36} animated={false} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#0099bb]">Site Settings</span>
            </div>
          </Link>
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-[#00264d] hover:text-[#0099bb] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-10 py-10">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-2">SETTINGS</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#00264d] tracking-tight">Site contact details</h1>
          <p className="mt-2 text-sm text-[#4A5568] max-w-2xl">
            Update the email, phone, address and notification settings shown on the public website. Changes are live immediately — no rebuild needed.
          </p>
        </div>

        {state.loading ? (
          <div className="bg-white border border-[#00264d]/10 p-12 text-center text-sm text-[#4A5568] rounded-sm" data-testid="admin-settings-loading">Loading settings…</div>
        ) : !form ? (
          <div className="bg-white border border-red-200 p-8 rounded-sm flex items-start gap-3" data-testid="admin-settings-fatal">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-display text-lg font-semibold text-[#00264d]">Couldn&apos;t load settings</p>
              <p className="mt-1 text-sm text-[#4A5568]">{state.error}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6" data-testid="admin-settings-form">
            <div className="bg-white border border-[#00264d]/10 rounded-sm divide-y divide-[#00264d]/10">
              {FIELDS.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.key} className="p-6 sm:p-7 grid sm:grid-cols-12 gap-5">
                    <div className="sm:col-span-4">
                      <div className="flex items-center gap-2.5">
                        {Icon && <Icon className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />}
                        <label className="font-display text-base font-semibold text-[#00264d]" htmlFor={f.key}>{f.label}</label>
                      </div>
                      <p className="mt-1.5 text-xs text-[#4A5568] leading-relaxed">{f.help}</p>
                    </div>
                    <div className="sm:col-span-8">
                      {f.type === "textarea" ? (
                        <textarea
                          id={f.key} rows={3} value={form[f.key] || ""} onChange={set(f.key)}
                          placeholder={f.placeholder}
                          className={`${inputCls} resize-y`}
                          data-testid={`admin-settings-${f.key.replace(/_/g, "-")}`}
                        />
                      ) : (
                        <input
                          id={f.key} type={f.type} value={form[f.key] || ""} onChange={set(f.key)}
                          placeholder={f.placeholder}
                          className={inputCls}
                          data-testid={`admin-settings-${f.key.replace(/_/g, "-")}`}
                        />
                      )}
                      {f.key === "notification_email" && form.notification_email && (
                        <p className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[#0099bb]">
                          New leads will be emailed to this address (once Resend key is configured)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {state.error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-sm" data-testid="admin-settings-error">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{state.error}</span>
              </div>
            )}
            {state.success && (
              <div className="flex items-start gap-2 text-sm text-[#003a7a] bg-[#E0F7FF] border border-[#00ccff]/40 px-4 py-3 rounded-sm" data-testid="admin-settings-success">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#0099bb]" /> <span>Site settings saved. The public site is now showing your changes.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/50">
                {dirty ? "You have unsaved changes" : "All changes saved"}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={reset} disabled={!dirty || state.saving} className="text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-sm transition-colors" data-testid="admin-settings-reset">
                  Reset
                </button>
                <button type="submit" disabled={!dirty || state.saving} className="inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors" data-testid="admin-settings-save">
                  <Save className="w-4 h-4" /> {state.saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
