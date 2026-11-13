import React, { useId } from "react";

interface BlogCoverProps {
  category?: {
    name: string;
    hue: number;
  } | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  categoryLabelPrefix?: string;
  className?: string;
}

export function BlogCover({
  category,
  coverImageUrl,
  coverImageAlt,
  categoryLabelPrefix,
  className = "",
}: BlogCoverProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const h = category?.hue ?? 160;
  const catName = category?.name ?? "General";
  const normCat = catName.toLowerCase().replace(/[\s-_]+/g, "");

  const stroke = `hsl(${h}, 70%, 66%)`;
  const fill = `hsl(${h}, 60%, 12%)`;
  const monoFont = "var(--mono)";

  function renderArt() {
    if (normCat.includes("algo")) {
      const nodes = [
        [200, 45],
        [130, 100],
        [270, 100],
        [90, 160],
        [170, 160],
        [230, 160],
        [310, 160],
      ];
      const edges = [
        [0, 1],
        [0, 2],
        [1, 3],
        [1, 4],
        [2, 5],
        [2, 6],
      ];
      return (
        <g>
          {edges.map(([u, v], i) => (
            <line
              key={i}
              x1={nodes[u][0]}
              y1={nodes[u][1]}
              x2={nodes[v][0]}
              y2={nodes[v][1]}
              stroke={stroke}
              strokeOpacity="0.5"
              strokeWidth="2"
            />
          ))}
          {nodes.map(([x, y], i) => (
            <React.Fragment key={i}>
              <circle
                cx={x}
                cy={y}
                r="17"
                fill={i === 4 ? stroke : fill}
                stroke={stroke}
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="12"
                style={{ fontFamily: monoFont }}
                fill={i === 4 ? fill : stroke}
              >
                {i * 3 + 2}
              </text>
            </React.Fragment>
          ))}
        </g>
      );
    }

    if (normCat.includes("web")) {
      return (
        <g>
          <rect x="70" y="34" width="260" height="156" rx="12" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="70" y1="58" x2="330" y2="58" stroke={stroke} strokeOpacity="0.4" />
          <circle cx="86" cy="46" r="4" fill="#ff7a6b" />
          <circle cx="100" cy="46" r="4" fill="#ffc857" />
          <circle cx="114" cy="46" r="4" fill={stroke} />
          <rect x="90" y="76" width="120" height="12" rx="4" fill={stroke} />
          <rect x="90" y="98" width="180" height="7" rx="3" fill={stroke} opacity="0.35" />
          <rect x="90" y="112" width="150" height="7" rx="3" fill={stroke} opacity="0.35" />
          <rect x="90" y="140" width="70" height="26" rx="13" fill={stroke} />
          <rect x="240" y="76" width="68" height="90" rx="8" fill={stroke} opacity="0.18" />
        </g>
      );
    }

    if (normCat.includes("computer") || normCat.includes("cs")) {
      const passes = ["main", "run_pass", "codegen", "emit", "opt", "alloc"];
      const widths = [300, 300, 220, 150, 90, 60];
      return (
        <g>
          {widths.map((w, i) => (
            <React.Fragment key={i}>
              <rect
                x={50 + (i % 2) * 14}
                y={40 + i * 26}
                width={w}
                height="20"
                rx="4"
                fill={stroke}
                opacity={0.85 - i * 0.12}
              />
              <text
                x={60 + (i % 2) * 14}
                y={54 + i * 26}
                fontSize="10"
                style={{ fontFamily: monoFont }}
                fill={fill}
              >
                {passes[i]}
              </text>
            </React.Fragment>
          ))}
        </g>
      );
    }

    // Checked before ML: "blockchain" contains "ai", which used to hit the ML art.
    if (normCat.includes("block") || normCat.includes("chain") || normCat.includes("crypto")) {
      return renderChain();
    }

    if (normCat.includes("machine") || normCat === "ml" || normCat === "ai") {
      const points = [
        [60, 170],
        [90, 150],
        [120, 160],
        [150, 120],
        [180, 125],
        [210, 90],
        [240, 80],
        [270, 60],
        [300, 70],
        [330, 45],
      ];
      return (
        <g>
          <line x1="40" y1="190" x2="360" y2="190" stroke={stroke} strokeOpacity="0.3" />
          <line x1="40" y1="30" x2="40" y2="190" stroke={stroke} strokeOpacity="0.3" />
          <path d="M50 175 C130 165 190 100 340 42" fill="none" stroke={stroke} strokeWidth="3" />
          {points.map(([px, py], i) => (
            <circle
              key={i}
              cx={px}
              cy={py + (i % 2 ? 8 : -8)}
              r="5"
              fill={stroke}
              opacity="0.75"
            />
          ))}
        </g>
      );
    }

    return renderDefault();
  }

  function renderChain() {
    const blocks = [
      [40, 90],
      [150, 60],
      [260, 90],
    ];
    return (
      <g>
        {blocks.map(([bx, by], i) => (
          <React.Fragment key={i}>
            <rect x={bx} y={by} width="96" height="76" rx="10" fill={fill} stroke={stroke} strokeWidth="2" />
            <rect x={bx + 12} y={by + 14} width="50" height="6" rx="3" fill={stroke} />
            <text x={bx + 12} y={by + 46} fontSize="10" style={{ fontFamily: monoFont }} fill={stroke} opacity="0.7">
              0x{i * 7 + 3}f9a
            </text>
            {i < 2 && (
              <line
                x1={bx + 96}
                y1={by + 38}
                x2={bx + 110}
                y2={i === 0 ? 98 : 128}
                stroke={stroke}
                strokeWidth="2"
              />
            )}
          </React.Fragment>
        ))}
      </g>
    );
  }

  function renderDefault() {
    // Default / Miscellaneous (.dll / gear design from reference)
    return (
      <g>
        <circle cx="160" cy="112" r="42" fill="none" stroke={stroke} strokeWidth="16" strokeDasharray="9 7" />
        <circle cx="160" cy="112" r="30" fill={fill} stroke={stroke} strokeWidth="2" />
        <circle cx="160" cy="112" r="10" fill={stroke} />
        <path d="M250 60h50l26 26v80a6 6 0 0 1-6 6h-70a6 6 0 0 1-6-6V66a6 6 0 0 1 6-6z" fill={fill} stroke={stroke} strokeWidth="2" />
        <text x="262" y="132" fontSize="16" style={{ fontFamily: monoFont }} fill={stroke}>
          .dll
        </text>
      </g>
    );
  }

  const gradId = `g_${uid}_${h}`;
  const patId = `d_${uid}_${h}`;

  return (
    <div
      className={`blog-cover ${className}`}
      style={{
        width: "100%",
        display: "block",
        position: "relative",
        overflow: "hidden",
        aspectRatio: "16/9",
        backgroundColor: `hsl(${h}, 55%, 9%)`,
        "--c1": `hsl(${h}, 55%, 9%)`,
      } as React.CSSProperties}
    >
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt={coverImageAlt || catName}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      ) : (
        <svg
          viewBox="0 0 400 225"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{ width: "100%", height: "100%", display: "block", position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id={gradId} cx="70%" cy="30%" r="75%">
              <stop offset="0%" stopColor={`hsl(${h}, 70%, 45%)`} stopOpacity="0.22" />
              <stop offset="100%" stopColor={`hsl(${h}, 60%, 8%)`} stopOpacity="0" />
            </radialGradient>
            <pattern id={patId} width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill={`hsl(${h}, 70%, 70%)`} opacity="0.18" />
            </pattern>
          </defs>
          <rect width="400" height="225" fill={`url(#${gradId})`} />
          <rect width="400" height="225" fill={`url(#${patId})`} />
          {renderArt()}
        </svg>
      )}
      <span className="blog-cat">
        {categoryLabelPrefix ? `${categoryLabelPrefix} · ` : ""}
        {catName}
      </span>
    </div>
  );
}
