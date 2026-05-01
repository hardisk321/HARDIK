import { useEffect, useState, useCallback } from "react";

const KEY = "drishti_compare_v1";
const MAX = 3;

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw).slice(0, MAX) : [];
  } catch { return []; }
}

function write(items) {
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new CustomEvent("drishti-compare-change", { detail: items }));
}

export function useCompare() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    const sync = (e) => setItems(e.detail || read());
    window.addEventListener("drishti-compare-change", sync);
    window.addEventListener("storage", () => setItems(read()));
    return () => window.removeEventListener("drishti-compare-change", sync);
  }, []);

  const has = useCallback((slug) => items.some((p) => p.slug === slug), [items]);

  const toggle = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.slug === product.slug);
      let next;
      if (exists) {
        next = prev.filter((p) => p.slug !== product.slug);
      } else if (prev.length >= MAX) {
        next = prev; // limit reached
      } else {
        // Store only the bits the compare bar / table needs (no big bytes)
        const slim = {
          slug: product.slug, name: product.name, brand: product.brand, form: product.form,
          category: product.category, image_url: product.image_url,
          price: product.price, price_currency: product.price_currency, price_on_request: product.price_on_request,
          dpi: product.dpi, width: product.width, tags: product.tags,
          short_desc: product.short_desc, specs: product.specs, use_cases: product.use_cases,
        };
        next = [...prev, slim];
      }
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.slug !== slug);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => { write([]); setItems([]); }, []);

  return { items, has, toggle, remove, clear, max: MAX };
}
