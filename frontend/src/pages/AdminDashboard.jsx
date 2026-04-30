import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Search, Download, LogOut, RefreshCw, Trash2, Mail, Phone, Building2, Tag, Inbox, X, ChevronLeft, ChevronRight, Package, Settings } from "lucide-react";
import { toast } from "sonner";
import client, { auth, formatApiError } from "@/lib/api";
import { DrishtiMark } from "@/components/Logo";

const PAGE = 20;

function formatDate(s) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch { return s; }
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const user = auth.getUser();

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await client.get("/admin/inquiries", {
        params: { limit: PAGE, skip: params.skip ?? skip, q: params.q ?? q },
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [skip, q]);

  useEffect(() => { load({ skip: 0 }); /* initial */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth.isAuthenticated()) return <Navigate to="/admin/login" replace />;

  const onSearch = (e) => {
    e.preventDefault();
    setSkip(0);
    load({ skip: 0, q });
  };

  const clearSearch = () => { setQ(""); setSkip(0); load({ skip: 0, q: "" }); };

  const page = Math.floor(skip / PAGE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  const go = (next) => {
    const nextSkip = Math.max(0, Math.min((pages - 1) * PAGE, skip + next * PAGE));
    setSkip(nextSkip);
    load({ skip: nextSkip });
  };

  const downloadCsv = async () => {
    try {
      const res = await client.get("/admin/inquiries/export.csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `drishti-inquiries-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded.");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    try {
      await client.delete(`/admin/inquiries/${id}`);
      toast.success("Deleted.");
      if (selected?.id === id) setSelected(null);
      load({});
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const logout = () => {
    auth.logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="admin-dashboard-page">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3" data-testid="admin-home-link">
            <DrishtiMark size={36} animated={false} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#0099bb]">Admin Console</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/admin/products" data-testid="admin-nav-products" className="hidden sm:inline-flex items-center gap-2 text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-[#00264d] hover:text-white px-3.5 py-2 rounded-sm transition-colors">
              <Package className="w-4 h-4" strokeWidth={1.75} />
              <span>Manage catalog</span>
            </Link>
            <Link to="/admin/settings" data-testid="admin-nav-settings" className="hidden sm:inline-flex items-center gap-2 text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-[#00264d] hover:text-white px-3.5 py-2 rounded-sm transition-colors">
              <Settings className="w-4 h-4" strokeWidth={1.75} />
              <span>Settings</span>
            </Link>
            <span className="hidden lg:inline font-mono text-[11px] tracking-[0.14em] text-[#00264d]/70 uppercase" data-testid="admin-user-email">
              {user?.email}
            </span>
            <button
              onClick={logout}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-[#00264d] hover:text-white px-3.5 py-2 rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-2">INQUIRIES</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#00264d] tracking-tight">Lead inbox</h1>
            <p className="mt-2 text-sm text-[#4A5568]">
              <span data-testid="admin-total-count">{total}</span> total inquiries · newest first
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => load({})}
              data-testid="admin-refresh"
              className="inline-flex items-center gap-2 text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-white px-3.5 py-2 rounded-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
              Refresh
            </button>
            <button
              onClick={downloadCsv}
              data-testid="admin-export-csv"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#00264d] hover:bg-[#003a7a] text-white px-4 py-2 rounded-sm transition-colors"
            >
              <Download className="w-4 h-4" strokeWidth={1.75} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="mb-5 flex gap-2 max-w-xl" data-testid="admin-search-form">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company, technology, message…"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#00264d]/15 text-sm text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 rounded-sm"
              data-testid="admin-search-input"
            />
            {q && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00264d]" data-testid="admin-search-clear">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" className="bg-[#00ccff] hover:bg-[#0099bb] text-[#00264d] hover:text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors" data-testid="admin-search-submit">
            Search
          </button>
        </form>

        {/* Table */}
        <div className="bg-white border border-[#00264d]/10 rounded-sm overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#4A5568]" data-testid="admin-loading">Loading inquiries…</div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center" data-testid="admin-empty-state">
              <Inbox className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.25} />
              <p className="font-display text-lg font-semibold text-[#00264d]">No inquiries yet</p>
              <p className="mt-1 text-sm text-[#4A5568]">
                {q ? "Nothing matches that search." : "New leads will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="admin-inquiries-table">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left">
                    <th className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Received</th>
                    <th className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Name</th>
                    <th className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Email</th>
                    <th className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60 hidden md:table-cell">Company</th>
                    <th className="px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60 hidden lg:table-cell">Interest</th>
                    <th className="px-5 py-3 w-24 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr
                      key={i.id}
                      className="border-t border-[#00264d]/10 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      onClick={() => setSelected(i)}
                      data-testid={`admin-inquiry-row-${i.id}`}
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#00264d]/70 whitespace-nowrap">{formatDate(i.created_at)}</td>
                      <td className="px-5 py-3.5 font-medium text-[#00264d]">{i.name}</td>
                      <td className="px-5 py-3.5 text-[#003a7a]">{i.email}</td>
                      <td className="px-5 py-3.5 text-[#4A5568] hidden md:table-cell">{i.company || "—"}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {i.interested_in ? (
                          <span className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[#0099bb]/40 text-[#0099bb] px-2 py-0.5 rounded-sm">{i.interested_in}</span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); del(i.id); }}
                          data-testid={`admin-delete-${i.id}`}
                          className="text-[#94A3B8] hover:text-red-600 transition-colors p-1"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {items.length > 0 && (
            <div className="border-t border-[#00264d]/10 px-5 py-3 flex items-center justify-between text-sm">
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#00264d]/60" data-testid="admin-pagination-info">
                Page {page} / {pages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={skip === 0}
                  onClick={() => go(-1)}
                  data-testid="admin-prev-page"
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#00264d]/15 rounded-sm disabled:opacity-40 hover:bg-[#F8FAFC]"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={skip + PAGE >= total}
                  onClick={() => go(1)}
                  data-testid="admin-next-page"
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#00264d]/15 rounded-sm disabled:opacity-40 hover:bg-[#F8FAFC]"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-[#00264d]/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
          data-testid="admin-detail-overlay"
        >
          <aside
            className="absolute right-0 top-0 bottom-0 w-full sm:max-w-lg bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="admin-detail-drawer"
          >
            <div className="px-7 py-6 border-b border-[#00264d]/10 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0099bb]">INQUIRY</div>
                <h3 className="font-display text-xl font-bold text-[#00264d] mt-1">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#00264d]" data-testid="admin-detail-close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-7 py-6 space-y-5">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />
                <a href={`mailto:${selected.email}`} className="text-[#003a7a] hover:text-[#00264d] underline">{selected.email}</a>
              </div>
              {selected.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />
                  <a href={`tel:${selected.phone}`} className="text-[#003a7a] hover:text-[#00264d]">{selected.phone}</a>
                </div>
              )}
              {selected.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />
                  <span className="text-[#4A5568]">{selected.company}</span>
                </div>
              )}
              {selected.interested_in && (
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase border border-[#0099bb]/40 text-[#0099bb] px-2 py-0.5 rounded-sm">{selected.interested_in}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#00264d]/10">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00264d]/60 mb-2">Message</div>
                <p className="text-[#003a7a] text-[15px] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="pt-4 border-t border-[#00264d]/10 font-mono text-[11px] tracking-[0.14em] uppercase text-[#00264d]/50">
                Received {formatDate(selected.created_at)}
              </div>

              <div className="pt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re:%20DRISHTI%20Inquiry`}
                  className="inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors"
                  data-testid="admin-detail-reply"
                >
                  <Mail className="w-4 h-4" strokeWidth={1.75} /> Reply via email
                </a>
                <button
                  onClick={() => del(selected.id)}
                  className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
                  data-testid="admin-detail-delete"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} /> Delete
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
