import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { auth, formatApiError } from "@/lib/api";
import { DrishtiMark } from "@/components/Logo";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [state, setState] = useState({ loading: false, error: null });

  if (auth.isAuthenticated()) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: null });
    try {
      await auth.login(form.email.trim(), form.password);
      toast.success("Welcome back.");
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = formatApiError(err);
      setState({ loading: false, error: msg });
      toast.error(msg);
    }
  };

  const inputCls = "w-full bg-white border border-[#00264d]/15 pl-11 pr-4 py-3 text-[15px] text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 transition-all rounded-sm";
  const labelCls = "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#00264d]/60 mb-2";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 relative" data-testid="admin-login-page">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00ccff]/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <a href="/" className="flex items-center gap-3 mb-10" data-testid="admin-login-home-link">
          <DrishtiMark size={44} />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#0099bb]">Admin Console</span>
          </div>
        </a>

        <div className="bg-white border border-[#00264d]/10 p-8 sm:p-10 rounded-sm shadow-sm">
          <h1 className="font-display text-3xl font-bold text-[#00264d] tracking-tight">Sign in</h1>
          <p className="mt-2 text-[#4A5568] text-sm">Authorized personnel only. Inquiry data is confidential.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
            <div>
              <label className={labelCls} htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
                <input
                  id="email" type="email" required autoComplete="username"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@drishti-aidc.com" className={inputCls}
                  data-testid="admin-login-email"
                />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
                <input
                  id="password" type="password" required autoComplete="current-password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className={inputCls}
                  data-testid="admin-login-password"
                />
              </div>
            </div>

            {state.error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-sm" data-testid="admin-login-error">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <button
              type="submit" disabled={state.loading}
              data-testid="admin-login-submit"
              className="group w-full inline-flex items-center justify-center gap-2 bg-[#00264d] hover:bg-[#003a7a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3.5 rounded-sm transition-colors"
            >
              {state.loading ? "Signing in…" : "Sign in"}
              {!state.loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />}
            </button>
          </form>

          <p className="mt-6 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/50 text-center">
            DRISHTI · Auto ID Solution
          </p>
        </div>
      </div>
    </div>
  );
}
