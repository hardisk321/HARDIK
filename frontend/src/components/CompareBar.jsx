import React from "react";
import { Link } from "react-router-dom";
import { Scale, X, ArrowRight } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { resolveImageUrl } from "@/lib/imageUrl";

export default function CompareBar() {
  const { items, remove, clear, max } = useCompare();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#00264d] text-white border-t border-[#00ccff]/30 shadow-2xl" data-testid="compare-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-3 sm:gap-5">
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Scale className="w-4 h-4 text-[#00ccff]" strokeWidth={1.75} />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00ccff] font-semibold">Compare</span>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">({items.length}/{max})</span>
        </div>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto" data-testid="compare-bar-items">
          {items.map((p) => (
            <div key={p.slug} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1.5 rounded-sm shrink-0" data-testid={`compare-bar-item-${p.slug}`}>
              {p.image_url && (
                <div className="w-8 h-8 bg-white/5 overflow-hidden rounded-sm shrink-0">
                  <img src={resolveImageUrl(p.image_url)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="hidden sm:block min-w-0">
                <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#00ccff]">{p.brand}</div>
                <div className="font-display text-xs font-semibold text-white truncate max-w-[140px]">{p.name}</div>
              </div>
              <span className="sm:hidden font-display text-xs font-semibold text-white truncate max-w-[100px]">{p.name}</span>
              <button onClick={() => remove(p.slug)} data-testid={`compare-remove-${p.slug}`} className="text-white/40 hover:text-white p-0.5" aria-label="Remove">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clear} data-testid="compare-clear" className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/50 hover:text-white px-2 py-1.5 transition-colors hidden sm:inline">
            Clear
          </button>
          <Link to="/catalog/compare" data-testid="compare-go" className="group inline-flex items-center gap-2 bg-[#00ccff] hover:bg-white text-[#00264d] text-sm font-semibold px-4 py-2 rounded-sm transition-colors disabled:opacity-50">
            Compare {items.length > 1 ? `(${items.length})` : ""}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
