import React from "react";

/**
 * DRISHTI brand logo — recreated as a faithful React component
 * Variants: "light" (color), "dark" (for dark backgrounds), "mono" (single tone)
 */
export const DrishtiMark = ({ size = 44, animated = true, variant = "light", className = "" }) => {
  const palette = variant === "dark"
    ? { tile: "#0a2448", panel: "#061830", bar: "#FFFFFF", barAlt: "#4da6ff", scan: "#00ddff", qrTile: "#061830", qrCell: "#4da6ff", rfidTile: "#081428", chip: "#008ab0", wave: "#00ccee", topAccent: "#00aacc" }
    : { tile: "#003a7a", panel: "#00264d", bar: "#FFFFFF", barAlt: "#4d9ee0", scan: "#00ccff", qrTile: "#00264d", qrCell: "#0066cc", rfidTile: "#003060", chip: "#0080b0", wave: "#00aadd", topAccent: "#0099bb" };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="DRISHTI logo">
      <rect x="2" y="2" width="96" height="96" rx="14" fill={palette.tile} />
      {/* Barcode panel */}
      <rect x="8" y="10" width="84" height="36" rx="4" fill={palette.panel} />
      {[
        [13, 3.5, "bar"], [18, 1.5, "alt"], [21, 4, "bar"], [27, 1.5, "alt"],
        [30, 3, "bar"], [35, 4.5, "alt"], [41, 1.5, "bar"], [44, 3.5, "alt"],
        [49, 5, "bar"], [56, 1.5, "alt"], [59, 3, "bar"], [64, 4, "alt"],
        [70, 2, "bar"], [74, 3.5, "alt"], [79, 4, "bar"], [85, 2, "alt"],
      ].map(([x, w, t], i) => (
        <rect key={i} x={x} y={14} width={w} height={26} fill={t === "bar" ? palette.bar : palette.barAlt} opacity={t === "alt" ? 0.85 : 1} />
      ))}
      <line
        x1="8" y1="27" x2="92" y2="27"
        stroke={palette.scan} strokeWidth="1.5"
        className={animated ? "scan-line" : ""}
        style={{ transformOrigin: "center" }}
      />
      {/* QR */}
      <rect x="8" y="52" width="36" height="36" rx="4" fill={palette.qrTile} />
      <rect x="12" y="56" width="10" height="10" rx="1" fill={palette.qrCell} />
      <rect x="13.5" y="57.5" width="7" height="7" fill={palette.qrTile} />
      <rect x="15" y="59" width="4" height="4" fill={palette.qrCell} />
      <rect x="26" y="56" width="10" height="10" rx="1" fill={palette.qrCell} />
      <rect x="27.5" y="57.5" width="7" height="7" fill={palette.qrTile} />
      <rect x="29" y="59" width="4" height="4" fill={palette.qrCell} />
      <rect x="12" y="70" width="10" height="10" rx="1" fill={palette.qrCell} />
      <rect x="13.5" y="71.5" width="7" height="7" fill={palette.qrTile} />
      <rect x="15" y="73" width="4" height="4" fill={palette.qrCell} />
      <rect x="24" y="68" width="4" height="4" fill={palette.qrCell} opacity=".7" />
      <rect x="30" y="72" width="4" height="4" fill={palette.qrCell} opacity=".5" />
      <rect x="36" y="68" width="4" height="4" fill={palette.qrCell} opacity=".6" />
      <rect x="36" y="76" width="4" height="4" fill={palette.qrCell} opacity=".7" />
      {/* RFID */}
      <rect x="56" y="52" width="36" height="36" rx="4" fill={palette.rfidTile} />
      <rect x="68" y="63" width="14" height="10" rx="2" fill={palette.chip} />
      <path d="M63,72 Q63,60 75,60" fill="none" stroke={palette.wave} strokeWidth="1.6" strokeLinecap="round" className={animated ? "rfid-r1" : ""} />
      <path d="M87,72 Q87,60 75,60" fill="none" stroke={palette.wave} strokeWidth="1.6" strokeLinecap="round" className={animated ? "rfid-r1" : ""} />
      <path d="M60,75 Q60,56 75,56" fill="none" stroke={palette.wave} strokeWidth="1.2" strokeLinecap="round" className={animated ? "rfid-r2" : ""} />
      <path d="M90,75 Q90,56 75,56" fill="none" stroke={palette.wave} strokeWidth="1.2" strokeLinecap="round" className={animated ? "rfid-r2" : ""} />
      <path d="M57,78 Q57,52 75,52" fill="none" stroke={palette.wave} strokeWidth="0.8" strokeLinecap="round" className={animated ? "rfid-r3" : ""} />
      <path d="M93,78 Q93,52 75,52" fill="none" stroke={palette.wave} strokeWidth="0.8" strokeLinecap="round" className={animated ? "rfid-r3" : ""} />
      {/* Top accent */}
      <rect x="2" y="2" width="96" height="6" rx="4" fill={palette.topAccent} />
      <text x="50" y="97" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontSize="5" fontWeight="700" fill={palette.topAccent} letterSpacing="2">AIDC</text>
    </svg>
  );
};

export const DrishtiWordmark = ({ tone = "dark", showTagline = true, size = "md" }) => {
  const sizes = {
    sm: { name: "text-lg", sub: "text-[10px]", tag: "text-[10px]" },
    md: { name: "text-xl", sub: "text-[10px]", tag: "text-[11px]" },
    lg: { name: "text-3xl", sub: "text-xs", tag: "text-sm" },
  };
  const s = sizes[size] || sizes.md;
  const nameColor = tone === "light" ? "text-white" : "text-[#00264d]";
  const subColor = tone === "light" ? "text-[#9fc8f0]" : "text-[#0099bb]";

  return (
    <div className="flex flex-col leading-tight">
      <span className={`font-display font-bold tracking-[0.18em] ${s.name} ${nameColor}`}>DRISHTI</span>
      <span className={`font-mono uppercase tracking-[0.28em] ${s.sub} ${subColor} mt-0.5`}>Auto ID Solution</span>
      {showTagline && (
        <span className={`${s.tag} ${tone === "light" ? "text-white/70" : "text-[#4A5568]"} italic mt-1`}>Your Insight Into Data.</span>
      )}
    </div>
  );
};
