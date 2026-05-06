// figure.jsx — line-art body / garment figure with measurement callouts
// Renders an SVG body silhouette + the garment overlay, with diff callouts
// styled like the reference (white pill with thin border, dotted leader line).

const { calloutText } = window.fittoData;

// ─────────────────────────────────────────────────────────────
// Shared SVG body (front view) — minimal line-art
// ─────────────────────────────────────────────────────────────
function BodySilhouette({ stroke = '#bdbab4', sw = 1.2 }) {
  // viewBox: 200 x 360 — simple front silhouette
  return (
    <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {/* head */}
      <ellipse cx="100" cy="34" rx="18" ry="22" />
      {/* neck */}
      <path d="M92 56 L92 66 Q100 70 108 66 L108 56" />
      {/* shoulders + torso outline (slim) */}
      <path d="M70 78 Q100 70 130 78
               L138 96
               Q142 130 138 168
               L132 200
               Q128 224 126 252
               L122 290
               L120 348
               L114 354" />
      <path d="M130 78
               Q100 70 70 78
               L62 96
               Q58 130 62 168
               L68 200
               Q72 224 74 252
               L78 290
               L80 348
               L86 354" />
      {/* arms */}
      <path d="M70 80 Q44 130 38 184 Q36 198 38 208 L48 210" />
      <path d="M130 80 Q156 130 162 184 Q164 198 162 208 L152 210" />
      {/* inner leg seam */}
      <path d="M100 200 L100 348" strokeDasharray="2 4" opacity="0.5" />
      {/* feet */}
      <path d="M82 354 L86 354 L86 358 L78 358 Z" fill={stroke} stroke="none" opacity="0.5" />
      <path d="M118 354 L114 354 L114 358 L122 358 Z" fill={stroke} stroke="none" opacity="0.5" />
    </g>
  );
}

// Pants overlay (drawn over the lower body)
function PantsOverlay({ accent = '#1c1c1c', highlight = '#6b7c5a' }) {
  return (
    <g fill="none" stroke={accent} strokeWidth="1.4" strokeLinejoin="round">
      {/* waistband */}
      <path d="M70 168 Q100 162 130 168 L132 174 Q100 170 68 174 Z"
            fill="#f6f4ee" stroke={accent} />
      {/* legs */}
      <path d="M68 174
               L62 250
               L60 320
               L56 352
               L80 354
               L88 320
               L94 260
               L100 200
               L106 260
               L112 320
               L120 354
               L144 352
               L140 320
               L138 250
               L132 174 Z"
            fill="#fbfaf6" stroke={accent} />
      {/* highlight: waist + hip + hem */}
      <path d="M70 170 Q100 165 130 170" stroke={highlight} strokeWidth="1.6" />
      <path d="M64 196 Q100 190 136 196" stroke={highlight} strokeWidth="1.6" />
      <path d="M56 352 L80 354" stroke={highlight} strokeWidth="1.6" />
      <path d="M120 354 L144 352" stroke={highlight} strokeWidth="1.6" />
    </g>
  );
}

// Tops overlay
function TopsOverlay({ accent = '#1c1c1c', highlight = '#6b7c5a' }) {
  return (
    <g fill="none" stroke={accent} strokeWidth="1.4" strokeLinejoin="round">
      {/* main body */}
      <path d="M64 78
               Q100 70 136 78
               L156 96
               L162 130
               L154 144
               L142 132
               L142 220
               Q100 226 58 220
               L58 132
               L46 144
               L38 130
               L44 96 Z"
            fill="#fbfaf6" stroke={accent} />
      {/* neckline */}
      <path d="M88 76 Q100 84 112 76" stroke={accent} />
      {/* highlight: shoulder + chest */}
      <path d="M64 80 Q100 72 136 80" stroke={highlight} strokeWidth="1.6" />
      <path d="M58 132 Q100 126 142 132" stroke={highlight} strokeWidth="1.6" />
      {/* sleeve highlight */}
      <path d="M152 138 L160 132" stroke={highlight} strokeWidth="1.6" />
    </g>
  );
}

// Outer overlay (longer, more structured)
function OuterOverlay({ accent = '#1c1c1c', highlight = '#6b7c5a' }) {
  return (
    <g fill="none" stroke={accent} strokeWidth="1.4" strokeLinejoin="round">
      <path d="M62 78
               Q100 70 138 78
               L160 100
               L172 200
               L160 220
               L148 200
               L148 280
               L140 290
               L100 290
               L60 290
               L52 280
               L52 200
               L40 220
               L28 200
               L40 100 Z"
            fill="#fbfaf6" stroke={accent} />
      {/* lapel/center */}
      <path d="M100 76 L100 290" stroke={accent} strokeDasharray="2 3" opacity="0.5" />
      <path d="M62 80 Q100 72 138 80" stroke={highlight} strokeWidth="1.6" />
      <path d="M52 200 L148 200" stroke={highlight} strokeWidth="1.6" />
      <path d="M60 290 L140 290" stroke={highlight} strokeWidth="1.6" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Callout: white pill near a body anchor, leader line to it
// ─────────────────────────────────────────────────────────────
function Callout({ x, y, ax, ay, headline, qual, side = 'left', tone = 'fit', big = false }) {
  // tone color
  const toneColor = {
    fit: '#1c1c1c',
    loose: '#6b7c5a',
    tight: '#b86a4a',
    major: '#b86a4a',
  }[tone] || '#1c1c1c';

  // pill width estimate
  const w = big ? 110 : 96;
  const h = qual ? 44 : 28;
  // pill position relative to anchor
  const px = side === 'left' ? x - w - 18 : x + 18;
  const py = y - h / 2;

  return (
    <g>
      {/* leader: dotted line + dot at anchor */}
      <line x1={ax} y1={ay} x2={x} y2={y} stroke="#9c9893" strokeWidth="0.8" strokeDasharray="1.5 2" />
      <circle cx={ax} cy={ay} r="2.4" fill="#6b7c5a" />
      {/* pill */}
      <g transform={`translate(${px} ${py})`}>
        <rect x="0" y="0" width={w} height={h} rx="3" ry="3"
              fill="#ffffff" stroke="#cdcac3" strokeWidth="0.8" />
        <text x={w/2} y={qual ? 16 : 18} textAnchor="middle"
              fontFamily='"Noto Sans JP", system-ui'
              fontSize="11" fontWeight="500" fill={toneColor}>
          {headline}
        </text>
        {qual ? (
          <text x={w/2} y={32} textAnchor="middle"
                fontFamily='"Noto Sans JP", system-ui'
                fontSize="10" fontWeight="400" fill="#4a4a4a">
            {qual}
          </text>
        ) : null}
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Anchor points per category × field (in viewBox coords)
// Each entry: { ax, ay (anchor on body), x, y (callout pos), side }
// ─────────────────────────────────────────────────────────────
const ANCHORS = {
  pants: {
    waist:  { ax: 100, ay: 170, x: 38,  y: 150, side: 'left' },
    hip:    { ax: 100, ay: 196, x: 162, y: 200, side: 'right' },
    thigh:  { ax: 96,  ay: 230, x: 38,  y: 244, side: 'left' },
    rise:   { ax: 100, ay: 184, x: 162, y: 158, side: 'right' },
    hem:    { ax: 70,  ay: 350, x: 36,  y: 326, side: 'left' },
    inseam: { ax: 100, ay: 280, x: 162, y: 296, side: 'right' },
  },
  tops: {
    shoulder: { ax: 100, ay: 78,  x: 38,  y: 60,  side: 'left' },
    chest:    { ax: 100, ay: 130, x: 38,  y: 138, side: 'left' },
    length:   { ax: 100, ay: 222, x: 162, y: 230, side: 'right' },
    sleeve:   { ax: 152, ay: 138, x: 162, y: 110, side: 'right' },
    cuff:     { ax: 152, ay: 144, x: 162, y: 168, side: 'right' },
    neck:     { ax: 100, ay: 76,  x: 162, y: 50,  side: 'right' },
  },
  outer: {
    shoulder: { ax: 100, ay: 78,  x: 38,  y: 60,  side: 'left' },
    chest:    { ax: 100, ay: 130, x: 38,  y: 130, side: 'left' },
    length:   { ax: 100, ay: 290, x: 162, y: 280, side: 'right' },
    sleeve:   { ax: 168, ay: 200, x: 162, y: 168, side: 'right' },
    hem:      { ax: 100, ay: 290, x: 38,  y: 250, side: 'left' },
  },
};

// ─────────────────────────────────────────────────────────────
// FigureCompare — main illustration with garment overlay + callouts
// ─────────────────────────────────────────────────────────────
function FigureCompare({ category, rows = [], showLabels = true, height = 360 }) {
  const Overlay =
    category === 'tops' ? TopsOverlay :
    category === 'outer' ? OuterOverlay :
    PantsOverlay;

  return (
    <svg viewBox="0 0 200 380" width="100%" style={{ display: 'block', maxHeight: height }}>
      <BodySilhouette />
      <Overlay />
      {showLabels && rows.map((r) => {
        if (r.diff == null) return null;
        const a = ANCHORS[category]?.[r.key];
        if (!a) return null;
        const c = calloutText(r.diff, r.axis);
        if (!c) return null;
        const tol = window.fittoData.TOLERANCE[r.key] || { fit: 2, loose: 4, major: 7 };
        const abs = Math.abs(r.diff);
        let tone = 'fit';
        if (abs > tol.major) tone = 'major';
        else if (abs > tol.loose) tone = (r.diff > 0 ? 'loose' : 'tight');
        else if (abs > tol.fit) tone = (r.diff > 0 ? 'loose' : 'tight');
        return (
          <Callout key={r.key}
                   ax={a.ax} ay={a.ay} x={a.x} y={a.y} side={a.side}
                   headline={c.headline} qual={c.qual} tone={tone} />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// FigureSimple — body + garment, no callouts (used in setup screen)
// ─────────────────────────────────────────────────────────────
function FigureSimple({ category, height = 320, accent = '#1c1c1c', highlightField = null }) {
  const Overlay =
    category === 'tops' ? TopsOverlay :
    category === 'outer' ? OuterOverlay :
    PantsOverlay;

  return (
    <svg viewBox="0 0 200 380" width="100%" style={{ display: 'block', maxHeight: height }}>
      <BodySilhouette />
      <Overlay accent={accent} highlight={highlightField ? '#b86a4a' : '#6b7c5a'} />
      {highlightField && ANCHORS[category]?.[highlightField] && (() => {
        const a = ANCHORS[category][highlightField];
        return (
          <g>
            <circle cx={a.ax} cy={a.ay} r="6" fill="none" stroke="#b86a4a" strokeWidth="1.4" />
            <circle cx={a.ax} cy={a.ay} r="2.5" fill="#b86a4a" />
          </g>
        );
      })()}
    </svg>
  );
}

window.fittoFigure = { FigureCompare, FigureSimple };
