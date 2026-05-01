import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X, Check, Minus, Mail } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { resolveImageUrl } from "@/lib/imageUrl";
import { priceDisplay } from "@/lib/price";
import { DrishtiMark } from "@/components/Logo";

const ROWS = [
  { label: "Brand", get: (p) => p.brand },
  { label: "Form factor", get: (p) => p.form },
  { label: "Resolution", get: (p) => (p.dpi ? `${p.dpi} dpi` : "—") },
  { label: "Print width", get: (p) => p.width || "—" },
  { label: "Price", get: (p) => priceDisplay(p), bold: true },
  { label: "Tags", get: (p) => (p.tags || []).join(", ") || "—" },
  { label: "Description", get: (p) => p.short_desc },
];

export default function CatalogCompare() {
  const { items, remove, clear } = useCompare();

  return (
    <div className="min-h-screen bg-white" data-testid="catalog-compare-page">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <DrishtiMark size={40} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#0099bb]">Compare</span>
            </div>
          </Link>
          <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-[#00264d] hover:text-[#0099bb] transition-colors" data-testid="compare-back">
            <ArrowLeft className="w-4 h-4" /> Back to catalog
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-3">SIDE-BY-SIDE</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#00264d] tracking-tight">Compare products</h1>
          </div>
          {items.length > 0 && (
            <button onClick={clear} className="text-sm text-[#00264d] border border-[#00264d]/20 hover:bg-[#F8FAFC] px-4 py-2 rounded-sm" data-testid="compare-page-clear">Clear all</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center border border-[#00264d]/10 rounded-sm" data-testid="compare-empty">
            <p className="font-display text-lg font-semibold text-[#00264d]">Nothing to compare yet</p>
            <p className="mt-2 text-sm text-[#4A5568]">Add up to 3 products from the catalog using the &ldquo;Compare&rdquo; toggle on each card.</p>
            <Link to="/catalog" className="mt-5 inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] text-white text-sm font-semibold px-5 py-2.5 rounded-sm">
              Browse catalog <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <>
            {/* Header row with images */}
            <div className="overflow-x-auto" data-testid="compare-table-wrapper">
              <div className="grid gap-px bg-[#00264d]/10 border border-[#00264d]/10" style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(220px, 1fr))` }}>
                {/* spacer */}
                <div className="bg-white p-5"></div>
                {items.map((p) => (
                  <div key={p.slug} className="bg-white p-5 relative" data-testid={`compare-col-${p.slug}`}>
                    <button onClick={() => remove(p.slug)} className="absolute top-3 right-3 text-[#94A3B8] hover:text-red-600" data-testid={`compare-col-remove-${p.slug}`} aria-label="Remove">
                      <X className="w-4 h-4" />
                    </button>
                    <Link to={`/product/${p.slug}`} className="block group">
                      <div className="aspect-[4/3] bg-[#F8FAFC] overflow-hidden rounded-sm mb-3">
                        <img src={resolveImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#0099bb]">{p.brand}</div>
                      <div className="font-display text-base font-semibold text-[#00264d] group-hover:text-[#0099bb] transition-colors">{p.name}</div>
                    </Link>
                  </div>
                ))}

                {/* Spec rows */}
                {ROWS.map((r) => (
                  <React.Fragment key={r.label}>
                    <div className="bg-[#F8FAFC] p-4 font-mono text-[10px] tracking-[0.22em] uppercase text-[#00264d]/70 font-semibold flex items-center">{r.label}</div>
                    {items.map((p) => (
                      <div key={`${r.label}-${p.slug}`} className={`bg-white p-4 text-sm text-[#00264d] ${r.bold ? "font-display font-semibold text-base" : ""}`}>
                        {r.get(p) || <Minus className="w-4 h-4 text-[#94A3B8]" />}
                      </div>
                    ))}
                  </React.Fragment>
                ))}

                {/* Specs list (bullet) */}
                <div className="bg-[#F8FAFC] p-4 font-mono text-[10px] tracking-[0.22em] uppercase text-[#00264d]/70 font-semibold">Key specs</div>
                {items.map((p) => (
                  <div key={`specs-${p.slug}`} className="bg-white p-4">
                    <ul className="space-y-1.5">
                      {(p.specs || []).slice(0, 6).map((s) => (
                        <li key={s} className="flex items-start gap-2 text-xs text-[#003a7a]">
                          <Check className="w-3 h-3 text-[#0099bb] mt-1 shrink-0" strokeWidth={2.5} />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* CTA row */}
                <div className="bg-[#F8FAFC] p-4 font-mono text-[10px] tracking-[0.22em] uppercase text-[#00264d]/70 font-semibold flex items-center">Action</div>
                {items.map((p) => (
                  <div key={`cta-${p.slug}`} className="bg-white p-4 space-y-2">
                    <Link
                      to={`/#contact`}
                      onClick={() => window.sessionStorage.setItem("drishti_prefill_interest", p.name)}
                      className="block w-full text-center bg-[#00264d] hover:bg-[#003a7a] text-white text-xs font-semibold py-2 rounded-sm transition-colors"
                      data-testid={`compare-quote-${p.slug}`}
                    >
                      Request quote
                    </Link>
                    <Link to={`/product/${p.slug}`} className="block w-full text-center border border-[#00264d]/20 text-[#00264d] hover:bg-[#F8FAFC] text-xs font-semibold py-2 rounded-sm transition-colors">
                      View details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk quote */}
            <div className="mt-10 p-6 bg-[#00264d] text-white rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00ccff] mb-1">Comparing {items.length} {items.length === 1 ? "product" : "products"}</div>
                <p className="text-white/80 text-sm">Want a single quote for all of these together? We&apos;ll match consumables, suggest the best fit and price the bundle in &lt;1 business day.</p>
              </div>
              <Link
                to={`/#contact`}
                onClick={() => window.sessionStorage.setItem("drishti_prefill_interest", items.map((p) => p.name).join(", "))}
                className="inline-flex items-center gap-2 bg-[#00ccff] hover:bg-white text-[#00264d] text-sm font-semibold px-5 py-3 rounded-sm transition-colors shrink-0"
                data-testid="compare-bulk-quote"
              >
                <Mail className="w-4 h-4" strokeWidth={1.75} /> Get bundle quote
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
