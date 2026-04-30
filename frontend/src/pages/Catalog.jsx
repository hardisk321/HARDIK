import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, X, Tag, Printer, Layers, Package, Filter } from "lucide-react";
import { CATALOG, CATEGORIES } from "@/data/catalog";
import { DrishtiMark } from "@/components/Logo";

const CAT_ICON = { printer: Printer, label: Tag, ribbon: Layers };

export default function Catalog() {
  const [activeCat, setActiveCat] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CATALOG.filter((p) => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (!needle) return true;
      const hay = [p.name, p.brand, p.form, p.desc, ...(p.tags || []), ...(p.specs || [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [activeCat, q]);

  const counts = useMemo(() => ({
    all: CATALOG.length,
    ...CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: CATALOG.filter((p) => p.category === c.id).length }), {}),
  }), []);

  return (
    <div className="min-h-screen bg-white" data-testid="catalog-page">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="catalog-home-link">
            <DrishtiMark size={40} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#0099bb]">Catalog</span>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#00264d] hover:text-[#0099bb] transition-colors"
            data-testid="catalog-back-home"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Back to site
          </Link>
        </div>
      </header>

      {/* Hero */}
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

      {/* Filter bar */}
      <div className="sticky top-20 z-20 bg-white border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Category chips */}
          <div className="flex items-center gap-2 flex-wrap" data-testid="catalog-category-filter">
            <Filter className="w-4 h-4 text-[#0099bb]" strokeWidth={1.75} />
            {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                data-testid={`catalog-cat-${c.id}`}
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

          {/* Search */}
          <div className="relative lg:ml-auto lg:max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" strokeWidth={1.75} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand, model, spec…"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#00264d]/15 text-sm text-[#00264d] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0099bb] focus:ring-2 focus:ring-[#00ccff]/30 rounded-sm"
              data-testid="catalog-search-input"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00264d]"
                data-testid="catalog-search-clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="mb-6 font-mono text-[11px] tracking-[0.18em] uppercase text-[#00264d]/60" data-testid="catalog-result-count">
          Showing <span className="text-[#00264d] font-bold">{filtered.length}</span> of {CATALOG.length} products
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center border border-[#00264d]/10 rounded-sm" data-testid="catalog-empty">
            <Package className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" strokeWidth={1.25} />
            <p className="font-display text-lg font-semibold text-[#00264d]">No products match</p>
            <p className="mt-1 text-sm text-[#4A5568]">Try clearing filters or contact us for sourcing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#00264d]/10 border border-[#00264d]/10">
            {filtered.map((p) => {
              const Icon = CAT_ICON[p.category] || Package;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  data-testid={`catalog-item-${p.id}`}
                  className="group relative text-left bg-white p-7 hover:bg-[#F8FAFC] transition-colors duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 flex items-center justify-center bg-[#00264d] group-hover:bg-[#00ccff] transition-colors duration-300 rounded-sm">
                      <Icon className="w-5 h-5 text-white group-hover:text-[#00264d] transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/50">{p.brand}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#00264d] tracking-tight mb-1.5">{p.name}</h3>
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#0099bb] mb-3">{p.form}</div>
                  <p className="text-[#4A5568] text-[14px] leading-relaxed mb-4 line-clamp-3">{p.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[#00264d]/10 px-2 py-0.5 text-[#003a7a] rounded-sm">{t}</span>
                    ))}
                    {p.tags.length > 3 && (
                      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#00264d]/50 px-2 py-0.5">+{p.tags.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-[#00264d]/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
          data-testid="catalog-detail-overlay"
        >
          <aside
            className="absolute right-0 top-0 bottom-0 w-full sm:max-w-xl bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="catalog-detail-drawer"
          >
            <div className="px-7 py-6 border-b border-[#00264d]/10 flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0099bb]">{selected.brand} · {selected.form}</div>
                <h3 className="font-display text-2xl font-bold text-[#00264d] mt-1 tracking-tight">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#94A3B8] hover:text-[#00264d]" data-testid="catalog-detail-close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-7 py-6 space-y-6">
              <p className="text-[#003a7a] text-[15px] leading-relaxed">{selected.desc}</p>

              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00264d]/60 mb-3">Specifications</div>
                <ul className="space-y-2">
                  {selected.specs.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-[#00264d]">
                      <span className="w-3 h-px bg-[#0099bb] mt-2.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00264d]/60 mb-3">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[#00264d]/15 px-2.5 py-1 text-[#003a7a] rounded-sm">{t}</span>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-[#00264d]/10 flex flex-wrap gap-2">
                <Link
                  to={`/#contact`}
                  state={{ interest: selected.name }}
                  onClick={() => window.sessionStorage.setItem("drishti_prefill_interest", selected.name)}
                  className="group inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] text-white text-sm font-semibold px-6 py-3 rounded-sm transition-colors"
                  data-testid="catalog-detail-quote"
                >
                  Request Quote for this
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </Link>
                <a
                  href={`mailto:info@drishti-aidc.com?subject=Spec%20check%20—%20${encodeURIComponent(selected.name)}`}
                  className="inline-flex items-center gap-2 border border-[#00264d] text-[#00264d] hover:bg-[#00264d] hover:text-white text-sm font-semibold px-5 py-3 rounded-sm transition-colors"
                  data-testid="catalog-detail-spec"
                >
                  Spec check via email
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
