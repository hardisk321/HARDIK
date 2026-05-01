import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ChevronRight } from "lucide-react";
import { DrishtiMark } from "@/components/Logo";
import { priceDisplay } from "@/lib/price";
import { resolveImageUrl } from "@/lib/imageUrl";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setStatus({ loading: true, error: null });
    axios.get(`${API}/products/${slug}`)
      .then(async (res) => {
        if (!alive) return;
        setProduct(res.data);
        // Fetch related (same category, exclude current)
        try {
          const rel = await axios.get(`${API}/products`, { params: { category: res.data.category, limit: 10 } });
          if (alive) setRelated((rel.data.items || []).filter((p) => p.slug !== slug).slice(0, 3));
        } catch { /* ignore */ }
        setStatus({ loading: false, error: null });
      })
      .catch((err) => {
        if (!alive) return;
        const msg = err?.response?.status === 404 ? "Product not found" : "Unable to load product";
        setStatus({ loading: false, error: msg });
      });
    return () => { alive = false; };
  }, [slug]);

  if (status.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" data-testid="product-loading">
        <div className="font-mono text-sm tracking-[0.18em] uppercase text-[#00264d]/60">Loading…</div>
      </div>
    );
  }

  if (status.error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6" data-testid="product-error">
        <h1 className="font-display text-3xl font-bold text-[#00264d]">{status.error || "Not found"}</h1>
        <Link to="/catalog" className="inline-flex items-center gap-2 bg-[#00264d] hover:bg-[#003a7a] text-white text-sm font-semibold px-6 py-3 rounded-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#00264d]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <DrishtiMark size={40} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-[0.18em] text-[#00264d]">DRISHTI</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#0099bb]">Product</span>
            </div>
          </Link>
          <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-[#00264d] hover:text-[#0099bb] transition-colors" data-testid="product-back-catalog">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} /> All products
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6">
        <nav className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#00264d]/60 flex items-center gap-2" aria-label="breadcrumb">
          <Link to="/" className="hover:text-[#00264d]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/catalog" className="hover:text-[#00264d]">Catalog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0099bb]">{product.category === "printer" ? "Printers" : product.category === "label" ? "Labels" : "Ribbons"}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#00264d]">{product.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="aspect-[4/3] bg-[#F8FAFC] border border-[#00264d]/10 overflow-hidden rounded-sm" data-testid="product-image-container">
              <img src={resolveImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" data-testid="product-image"
                   onError={(e) => { e.currentTarget.src = "https://images.pexels.com/photos/3060328/pexels-photo-3060328.jpeg?auto=compress&cs=tinysrgb&w=1200"; }} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-3">{product.brand} · {product.form}</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#00264d] tracking-tight leading-[1.05]" data-testid="product-name">{product.name}</h1>
            <p className="mt-5 text-[#4A5568] text-lg leading-relaxed" data-testid="product-short-desc">{product.short_desc}</p>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span key={t} className="font-mono text-[10px] tracking-[0.14em] uppercase border border-[#00264d]/15 px-2.5 py-1 text-[#003a7a] rounded-sm">{t}</span>
              ))}
            </div>

            <div className="mt-6 p-5 border border-[#00264d]/10 bg-[#F8FAFC] rounded-sm" data-testid="product-price-block">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#0099bb] mb-1.5">Indicative Price</div>
              <div className={`font-display ${product.price_on_request || product.price == null ? "text-2xl text-[#00264d]/80 italic" : "text-3xl text-[#00264d] font-bold"}`}>
                {priceDisplay(product)}
              </div>
              {product.price_on_request || product.price == null ? (
                <p className="mt-2 text-xs text-[#4A5568]">Final pricing depends on quantity, configuration and consumables. Get a tailored quote in &lt;1 business day.</p>
              ) : (
                <p className="mt-2 text-xs text-[#4A5568]">Excludes GST. Bulk &amp; AMC pricing available — request a tailored quote for your volume.</p>
              )}
            </div>

            <div className="mt-6 p-6 bg-[#00264d] rounded-sm text-white">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#00ccff] mb-2">Interested in pricing?</div>
              <p className="text-white/80 text-sm leading-relaxed">Send us a quick note — we&apos;ll respond with a tailored quote, stock availability and matching consumables within one business day.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/#contact`}
                  onClick={() => window.sessionStorage.setItem("drishti_prefill_interest", product.name)}
                  data-testid="product-quote-cta"
                  className="group inline-flex items-center gap-2 bg-[#00ccff] hover:bg-white text-[#00264d] text-sm font-semibold px-5 py-3 rounded-sm transition-colors"
                >
                  Request Quote
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </Link>
                <a
                  href={`mailto:info@drishti-aidc.com?subject=Spec%20check%20—%20${encodeURIComponent(product.name)}`}
                  data-testid="product-email-cta"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white text-sm font-semibold px-5 py-3 rounded-sm transition-colors"
                >
                  <Mail className="w-4 h-4" strokeWidth={1.75} /> Email us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail grid */}
      <section className="bg-[#F8FAFC] border-t border-[#00264d]/10 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">OVERVIEW</div>
            <p className="text-[#003a7a] text-lg leading-relaxed whitespace-pre-wrap" data-testid="product-long-desc">{product.long_desc}</p>

            {product.use_cases?.length > 0 && (
              <div className="mt-10">
                <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">IDEAL FOR</div>
                <ul className="grid sm:grid-cols-2 gap-3" data-testid="product-use-cases">
                  {product.use_cases.map((u) => (
                    <li key={u} className="flex items-start gap-2 text-[#00264d]">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#0099bb] shrink-0" strokeWidth={1.75} />
                      <span className="text-sm">{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border border-[#00264d]/10 p-7 rounded-sm sticky top-28" data-testid="product-specs">
              <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-5">SPECIFICATIONS</div>
              <dl className="space-y-3">
                {product.dpi && (
                  <div className="flex justify-between py-2 border-b border-[#00264d]/10">
                    <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Resolution</dt>
                    <dd className="text-[#00264d] text-sm font-medium">{product.dpi} dpi</dd>
                  </div>
                )}
                {product.width && (
                  <div className="flex justify-between py-2 border-b border-[#00264d]/10">
                    <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Print Width</dt>
                    <dd className="text-[#00264d] text-sm font-medium">{product.width}</dd>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-[#00264d]/10">
                  <dt className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#00264d]/60">Form Factor</dt>
                  <dd className="text-[#00264d] text-sm font-medium">{product.form}</dd>
                </div>
              </dl>

              <ul className="mt-5 space-y-2">
                {product.specs.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-[#00264d]">
                    <span className="w-3 h-px bg-[#0099bb] mt-2.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">YOU MAY ALSO LIKE</div>
            <h2 className="font-display text-3xl font-bold text-[#00264d] tracking-tight mb-10">Related products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-related">
              {related.map((r) => (
                <Link key={r.slug} to={`/product/${r.slug}`} className="group bg-white border border-[#00264d]/10 hover:border-[#0099bb]/50 hover:shadow-lg transition-all overflow-hidden rounded-sm">
                  <div className="aspect-[4/3] bg-[#F8FAFC] overflow-hidden">
                    <img src={resolveImageUrl(r.image_url)} alt={r.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#0099bb] mb-1">{r.brand}</div>
                    <h3 className="font-display text-lg font-semibold text-[#00264d] group-hover:text-[#0099bb] transition-colors">{r.name}</h3>
                    <p className="text-[#4A5568] text-sm mt-1.5 line-clamp-2">{r.short_desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
