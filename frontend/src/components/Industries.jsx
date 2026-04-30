import React from "react";

const INDUSTRIES = [
  {
    name: "Logistics & Warehousing",
    tag: "01 / 04",
    img: "https://images.unsplash.com/photo-1714627798569-b3e36d409c4b?crop=entropy&cs=srgb&fm=jpg&q=85",
    span: "lg:col-span-2 lg:row-span-2",
    summary: "Inbound, putaway, picking, dispatch — RFID gateways and handheld scanners drive sub-second visibility across DCs and yards.",
  },
  {
    name: "Retail & POS",
    tag: "02 / 04",
    img: "https://images.unsplash.com/photo-1742238896849-303d74d8a8de?crop=entropy&cs=srgb&fm=jpg&q=85",
    span: "lg:col-span-2",
    summary: "Lane scanners, smart shelves, mobile checkout and loss prevention.",
  },
  {
    name: "Manufacturing",
    tag: "03 / 04",
    img: "https://images.pexels.com/photos/34207359/pexels-photo-34207359.jpeg",
    span: "",
    summary: "WIP traceability, serialization, lineside scanning.",
  },
  {
    name: "Healthcare",
    tag: "04 / 04",
    img: "https://images.unsplash.com/photo-1758691462620-9018c602ed3e?crop=entropy&cs=srgb&fm=jpg&q=85",
    span: "",
    summary: "Patient ID, drug traceability, asset tracking.",
  },
];

export default function Industries() {
  return (
    <section id="industries" data-testid="industries-section" className="bg-[#F8FAFC] py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[#0099bb] font-semibold mb-4">INDUSTRIES SERVED</div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#00264d] tracking-tight leading-[1.05]">
              Built for the operators<br /> moving the world.
            </h2>
          </div>
          <p className="text-[#4A5568] text-base lg:max-w-md">
            Whatever your throughput, regulation or environment — DRISHTI deploys and supports AIDC in the field, on the line and at the dock.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 sm:gap-4 lg:h-[640px]">
          {INDUSTRIES.map((ind) => (
            <article
              key={ind.name}
              data-testid={`industry-${ind.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`group relative overflow-hidden bg-[#00264d] ${ind.span} min-h-[260px]`}
            >
              <img
                src={ind.img}
                alt={ind.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00264d] via-[#00264d]/40 to-transparent" />
              <div className="relative z-10 h-full p-6 lg:p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.28em] text-white/70">{ind.tag}</span>
                  <span className="w-8 h-px bg-[#00ccff]" />
                </div>
                <div>
                  <h3 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight">{ind.name}</h3>
                  <p className="mt-2 text-sm text-white/80 max-w-md leading-relaxed">{ind.summary}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
