import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, Search, X, Filter, Package, Printer, Tag, Layers, Scale } from "lucide-react";
import { DrishtiMark } from "@/components/Logo";
import { priceDisplay } from "@/lib/price";
import { resolveImageUrl } from "@/lib/imageUrl";
import { useCompare } from "@/hooks/useCompare";
import CompareBar from "@/components/CompareBar";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CAT_ICON = { printer: Printer, label: Tag, ribbon: Layers };
const CATEGORIES = [
  { id: "printer", label: "Label Printers" },
  { id: "label", label: "Barcode Labels" },
  { id: "ribbon", label: "Thermal Ribbons" },
];

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const { has: inCompare, toggle: toggleCompare, items: compareItems, max: COMPARE_MAX } = useCompare();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    axios.get(`${API}/products`, { params: { limit: 500 } })
      .then((res) => { if (alive) setItems(res.data.items || []); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((p) => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (!needle) return true;
      const hay = [p.name, p.brand, p.form, p.short_desc, ...(p.tags || []), ...(p.specs || [])].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [items, activeCat, q]);

  const counts = useMemo(() => ({
    all: items.length,
    ...CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: items.filter((p) => p.category === c.id).length }), {}),
  }), [items]);

  return (
    <div className="min-h-screen bg-white" data-testid="catalog-page">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="catalog-home-link">
            <DrishtiMark size={40} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#0099bb]">Catalog</span>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#00264d] hover:text-[#0099bb] transition-colors" data-testid="catalog-back-home">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} /> Back to site
          </Link>
        </div>
      </header>

      <section className="relative bg-[#F8FAFC] border-b border-[#00264d]/10 overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">PRODUCT CATALOG · 2026</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#00264d] tracking-tight leading-[1.05]">
            Every label, ribbon &amp; printer<br />we sell — searchable.
          </h1>
          <p className="mt-5 text-[#4A5568] text-lg max-w-2xl">
            Live-filter by category, brand, face-stock or use-case. Can&apos;t find your exact SKU? Send us the spec and we&apos;ll source or slit to order.
          </p>
        </div>
      </section>

      <div className="sticky top-20 z-20 bg-white border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap" data-testid="catalog-category-filter">
            <Filter className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />
            {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => (
              <button
                key={c.id} onClick={() => setActiveCat(c.id)} data-testid={`catalog-cat-${c.id}`}
                className={`font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-sm border transition-colors ${
                  activeCat === c.id
                    ? "bg-[#00264d] text-white border-[#00264d]"
                    : "bg-white text-[#00264d] border-[#00264d]/15 hover:border-[#0099bb] hover:text-[#0099bb]"
                }`}
              >
                {c.label} <span className="opacity-60 ml-1">({counts[c.id] || 0})</span>
              </button>
            ))}
          </div>
          <div className="relative lg:ml-auto lg:max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, model, spec…"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#00264d]/15 text-sm text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 rounded-sm"
              data-testid="catalog-search-input"
            />
            {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00264d]" data-testid="catalog-search-clear"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="mb-6 font-mono text-[11px] tracking-[0.18em] uppercase text-[#00264d]/60" data-testid="catalog-result-count">
          Showing <span className="text-[#00264d] font-bold">{filtered.length}</span> of {items.length} products
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#4A5568]" data-testid="catalog-loading">Loading catalog…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-[#00264d]/10 rounded-sm" data-testid="catalog-empty">
            <Package className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.25} />
            <p className="font-display text-lg font-semibold text-[#00264d]">No products match</p>
            <p className="mt-1 text-sm text-[#4A5568]">Try clearing filters or contact us for sourcing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const Icon = CAT_ICON[p.category] || Package;
              return (
                <div key={p.slug} className="group bg-white border border-[#00264d]/10 hover:border-[#0099bb]/50 hover:shadow-lg transition-all duration-300 overflow-hidden rounded-sm flex flex-col relative">
                  <Link to={`/product/${p.slug}`} data-testid={`catalog-item-${p.slug}`} className="flex flex-col h-full">
                    <div className="aspect-[4/3] bg-[#F8FAFC] overflow-hidden relative">
                      <img
                        src={resolveImageUrl(p.image_url)} alt={p.name} loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 w-10 h-10 flex items-center justify-center bg-[#00264d]/90 backdrop-blur-sm rounded-sm">
                        <Icon className="w-4 h-4 text-[#00ccff]" strokeWidth={1.5} />
                      </div>
                      {p.featured && (
                        <span className="absolute top-3 right-3 font-mono text-[9px] tracking-[0.22em] uppercase bg-[#00ccff] text-[#00264d] px-2 py-1 font-bold rounded-sm">Featured</span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#0099bb] mb-1.5">{p.brand} · {p.form}</div>
                      <h3 className="font-display text-xl font-semibold text-[#00264d] tracking-tight group-hover:text-[#0099bb] transition-colors">{p.name}</h3>
                      <p className="text-[#4A5568] text-[14px] leading-relaxed mt-2 mb-4 line-clamp-2 flex-1">{p.short_desc}</p>
                      <div className="pt-3 border-t border-dashed border-[#00264d]/10 space-y-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-[#00264d]/50">Price</span>
                            <span className={`font-display text-base font-bold ${p.price_on_request || p.price == null ? "text-[#00264d]/70 italic" : "text-[#00264d]"}`} data-testid={`product-price-${p.slug}`}>
                              {priceDisplay(p)}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.18em] uppercase text-[#0099bb] group-hover:text-[#00264d] transition-colors">
                            Details <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {p.tags.slice(0, 2).map((t) => (
                            <span key={t} className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#003a7a]">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Compare toggle (outside the link) */}
                  {(() => {
                    const checked = inCompare(p.slug);
                    const limitReached = !checked && compareItems.length >= COMPARE_MAX;
                    return (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!limitReached) toggleCompare(p); }}
                        disabled={limitReached}
                        data-testid={`catalog-compare-toggle-${p.slug}`}
                        title={limitReached ? `Compare limit reached (${COMPARE_MAX})` : checked ? "Remove from compare" : "Add to compare"}
                        className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-sm border transition-colors ${
                          checked
                            ? "bg-[#00ccff] text-[#00264d] border-[#00ccff]"
                            : limitReached
                            ? "bg-white text-[#94A3B8] border-[#94A3B8]/30 cursor-not-allowed"
                            : "bg-white text-[#0099bb] border-[#0099bb]/40 hover:bg-[#0099bb] hover:text-white"
                        }`}
                      >
                        <Scale className="w-3 h-3" strokeWidth={2} />
                        {checked ? "Added" : "Compare"}
                      </button>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <CompareBar />
    </div>
  );
}
