import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft, Image as ImageIcon, AlertCircle, Search, Star, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import client, { auth, formatApiError } from "@/lib/api";
import { DrishtiMark } from "@/components/Logo";

const CATEGORIES = [
  { id: "printer", label: "Printer" },
  { id: "label", label: "Label" },
  { id: "ribbon", label: "Ribbon" },
];

const EMPTY = {
  slug: "", category: "printer", name: "", brand: "", form: "",
  dpi: "", width: "", tags: "", short_desc: "", long_desc: "",
  specs: "", use_cases: "", image_url: "", featured: false,
};

const slugify = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export default function AdminProducts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // { mode: "create"|"edit", form, saving, error }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get("/products", { params: { limit: 500 } });
      setItems(data.items || []);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!auth.isAuthenticated()) { navigate("/admin/login", { replace: true }); return null; }

  const filtered = items.filter((p) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return [p.name, p.brand, p.slug, p.category].some((s) => (s || "").toLowerCase().includes(needle));
  });

  const startCreate = () => setEditing({ mode: "create", form: { ...EMPTY }, saving: false, error: null });
  const startEdit = (p) => setEditing({
    mode: "edit",
    form: {
      slug: p.slug,
      category: p.category,
      name: p.name,
      brand: p.brand,
      form: p.form,
      dpi: p.dpi ?? "",
      width: p.width || "",
      tags: (p.tags || []).join(", "),
      short_desc: p.short_desc,
      long_desc: p.long_desc,
      specs: (p.specs || []).join("\n"),
      use_cases: (p.use_cases || []).join("\n"),
      image_url: p.image_url || "",
      featured: !!p.featured,
    },
    saving: false, error: null,
  });
  const cancelEdit = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    setEditing((e) => ({ ...e, saving: true, error: null }));

    const payload = {
      slug: f.slug.trim(),
      category: f.category,
      name: f.name.trim(),
      brand: f.brand.trim(),
      form: f.form.trim(),
      dpi: f.dpi === "" ? null : Number(f.dpi),
      width: f.width.trim() || null,
      tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean),
      short_desc: f.short_desc.trim(),
      long_desc: f.long_desc.trim(),
      specs: f.specs.split("\n").map((s) => s.trim()).filter(Boolean),
      use_cases: f.use_cases.split("\n").map((s) => s.trim()).filter(Boolean),
      image_url: f.image_url.trim() || null,
      featured: !!f.featured,
    };

    try {
      if (editing.mode === "create") {
        await client.post("/admin/products", payload);
        toast.success(`${payload.name} created`);
      } else {
        // PUT — strip slug (immutable)
        const { slug: _s, ...body } = payload;
        await client.put(`/admin/products/${editing.form.slug}`, body);
        toast.success(`${payload.name} updated`);
      }
      setEditing(null);
      await load();
    } catch (err) {
      const msg = formatApiError(err);
      setEditing((e) => ({ ...e, saving: false, error: msg }));
      toast.error(msg);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}" permanently?`)) return;
    try {
      await client.delete(`/admin/products/${p.slug}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const inputCls = "w-full bg-white border border-[#00264d]/15 px-4 py-2.5 text-sm text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 transition-all rounded-sm";
  const labelCls = "block font-mono text-[10px] uppercase tracking-[0.22em] text-[#00264d]/60 mb-2";

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="admin-products-page">
      <header className="sticky top-0 z-40 bg-white border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3" data-testid="admin-products-back">
            <DrishtiMark size={36} animated={false} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#0099bb]">Catalog Admin</span>
            </div>
          </Link>
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-[#00264d] hover:text-[#0099bb] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-2">CATALOG</div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#00264d] tracking-tight">Manage products</h1>
            <p className="mt-2 text-sm text-[#4A5568]"><span data-testid="admin-products-count">{items.length}</span> products in catalog</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} data-testid="admin-products-refresh" className="inline-flex items-center gap-2 text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-white px-3.5 py-2 rounded-sm transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} /> Refresh
            </button>
            <button onClick={startCreate} data-testid="admin-products-new" className="inline-flex items-center gap-2 text-sm font-semibold bg-[#00264d] hover:bg-[#003a7a] text-white px-4 py-2 rounded-sm transition-colors">
              <Plus className="w-4 h-4" /> New product
            </button>
          </div>
        </div>

        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, brand, slug, category…"
                 className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#00264d]/15 text-sm text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 rounded-sm"
                 data-testid="admin-products-search" />
        </div>

        <div className="bg-white border border-[#00264d]/10 rounded-sm overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#4A5568]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center" data-testid="admin-products-empty">
              <Package className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.25} />
              <p className="font-display text-lg font-semibold text-[#00264d]">No products</p>
              <p className="mt-1 text-sm text-[#4A5568]">{q ? "Nothing matches." : "Click 'New product' to add your first SKU."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="admin-products-table">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left">
                    <th className="px-4 py-3 w-20 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Image</th>
                    <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Name</th>
                    <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60 hidden md:table-cell">Brand</th>
                    <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Category</th>
                    <th className="px-4 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60 hidden lg:table-cell">Slug</th>
                    <th className="px-4 py-3 w-24 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.slug} className="border-t border-[#00264d]/10 hover:bg-[#F8FAFC] transition-colors" data-testid={`admin-product-row-${p.slug}`}>
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-[#F8FAFC] border border-[#00264d]/10 overflow-hidden rounded-sm">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                          ) : <ImageIcon className="w-5 h-5 m-3.5 text-[#94A3B8]" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#00264d]">
                        <div className="flex items-center gap-2">
                          {p.featured && <Star className="w-3.5 h-3.5 text-[#00ccff] fill-[#00ccff]" />}
                          {p.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4A5568] hidden md:table-cell">{p.brand}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[#0099bb]/40 text-[#0099bb] px-2 py-0.5 rounded-sm">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#00264d]/60 hidden lg:table-cell">{p.slug}</td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button onClick={() => startEdit(p)} data-testid={`admin-product-edit-${p.slug}`} className="text-[#0099bb] hover:text-[#00264d] p-1" aria-label="Edit"><Pencil className="w-4 h-4" strokeWidth={1.75} /></button>
                        <button onClick={() => del(p)} data-testid={`admin-product-delete-${p.slug}`} className="text-[#94A3B8] hover:text-red-600 p-1" aria-label="Delete"><Trash2 className="w-4 h-4" strokeWidth={1.75} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit / Create drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-[#00264d]/60 backdrop-blur-sm" onClick={cancelEdit}>
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="admin-product-editor">
            <div className="px-7 py-6 border-b border-[#00264d]/10 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0099bb]">{editing.mode === "create" ? "NEW PRODUCT" : "EDIT PRODUCT"}</div>
                <h3 className="font-display text-2xl font-bold text-[#00264d] mt-1">{editing.form.name || "Untitled"}</h3>
              </div>
              <button onClick={cancelEdit} className="text-[#94A3B8] hover:text-[#00264d]" data-testid="admin-product-editor-close"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-7 py-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input value={editing.form.name} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, name: e.target.value, slug: ed.mode === "create" ? slugify(e.target.value) : ed.form.slug } }))} className={inputCls} data-testid="admin-product-field-name" />
                </div>
                <div>
                  <label className={labelCls}>Slug * {editing.mode === "edit" && <span className="text-[#94A3B8]">(immutable)</span>}</label>
                  <input value={editing.form.slug} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, slug: slugify(e.target.value) } }))} disabled={editing.mode === "edit"} className={`${inputCls} font-mono ${editing.mode === "edit" ? "opacity-60" : ""}`} data-testid="admin-product-field-slug" />
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select value={editing.form.category} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, category: e.target.value } }))} className={inputCls} data-testid="admin-product-field-category">
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Brand *</label>
                  <input value={editing.form.brand} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, brand: e.target.value } }))} className={inputCls} data-testid="admin-product-field-brand" />
                </div>
                <div>
                  <label className={labelCls}>Form factor *</label>
                  <input value={editing.form.form} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, form: e.target.value } }))} placeholder="e.g. Desktop, Industrial, Grade: Wax" className={inputCls} data-testid="admin-product-field-form" />
                </div>
                <div>
                  <label className={labelCls}>DPI</label>
                  <input type="number" value={editing.form.dpi} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, dpi: e.target.value } }))} placeholder="203" className={inputCls} data-testid="admin-product-field-dpi" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Width</label>
                  <input value={editing.form.width} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, width: e.target.value } }))} placeholder="e.g. 4-inch" className={inputCls} data-testid="admin-product-field-width" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Image URL</label>
                <input value={editing.form.image_url} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, image_url: e.target.value } }))} placeholder="https://…" className={inputCls} data-testid="admin-product-field-image" />
                {editing.form.image_url && (
                  <div className="mt-2 w-32 h-24 bg-[#F8FAFC] border border-[#00264d]/10 rounded-sm overflow-hidden">
                    <img src={editing.form.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Short description *</label>
                <textarea rows={2} value={editing.form.short_desc} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, short_desc: e.target.value } }))} className={`${inputCls} resize-y`} data-testid="admin-product-field-short" />
              </div>
              <div>
                <label className={labelCls}>Long description *</label>
                <textarea rows={5} value={editing.form.long_desc} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, long_desc: e.target.value } }))} className={`${inputCls} resize-y`} data-testid="admin-product-field-long" />
              </div>
              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input value={editing.form.tags} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, tags: e.target.value } }))} placeholder="Desktop, 203 dpi, Retail" className={inputCls} data-testid="admin-product-field-tags" />
              </div>
              <div>
                <label className={labelCls}>Specs (one per line)</label>
                <textarea rows={5} value={editing.form.specs} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, specs: e.target.value } }))} placeholder="203 dpi&#10;4-inch print width&#10;USB + Ethernet" className={`${inputCls} font-mono resize-y`} data-testid="admin-product-field-specs" />
              </div>
              <div>
                <label className={labelCls}>Use cases (one per line)</label>
                <textarea rows={3} value={editing.form.use_cases} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, use_cases: e.target.value } }))} className={`${inputCls} resize-y`} data-testid="admin-product-field-usecases" />
              </div>
              <label className="flex items-center gap-3 text-sm text-[#00264d] cursor-pointer" data-testid="admin-product-field-featured-wrapper">
                <input type="checkbox" checked={editing.form.featured} onChange={(e) => setEditing((ed) => ({ ...ed, form: { ...ed.form, featured: e.target.checked } }))} className="w-4 h-4 accent-[#00ccff]" data-testid="admin-product-field-featured" />
                <span className="font-medium">Featured product</span> <span className="text-[#94A3B8] text-xs">(shows star badge on catalog cards)</span>
              </label>

              {editing.error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-sm" data-testid="admin-product-editor-error">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{editing.error}</span>
                </div>
              )}
            </div>

            <div className="px-7 py-5 border-t border-[#00264d]/10 sticky bottom-0 bg-white flex gap-2 justify-end">
              <button onClick={cancelEdit} className="text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-[#F8FAFC] px-4 py-2.5 rounded-sm transition-colors" data-testid="admin-product-cancel">Cancel</button>
              <button onClick={save} disabled={editing.saving || !editing.form.name || !editing.form.slug || !editing.form.brand || !editing.form.form || !editing.form.short_desc || !editing.form.long_desc} className="inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors" data-testid="admin-product-save">
                <Save className="w-4 h-4" /> {editing.saving ? "Saving…" : editing.mode === "create" ? "Create product" : "Save changes"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
