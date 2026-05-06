// screens-home.jsx — Home, wardrobe list, history

const { CATEGORIES } = window.fittoData;

// ─────────────────────────────────────────────────────────────
// Shared UI primitives (used across screens)
// ─────────────────────────────────────────────────────────────
function Chrome({ title, leading, trailing, children, scroll = true }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100%', height: '100%',
      background: '#faf8f4'
    }}>
      {/* nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 18px 10px', minHeight: 44
      }}>
        <div style={{ minWidth: 64, display: 'flex', alignItems: 'center' }}>{leading}</div>
        <div style={{
          fontFamily: '"Cormorant Garamond", "Noto Sans JP", serif',
          fontSize: 18, fontWeight: 500, letterSpacing: '0.02em',
          color: '#1c1c1c'
        }}>{title}</div>
        <div style={{ minWidth: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>{trailing}</div>
      </div>
      <div style={{
        flex: 1, overflowY: scroll ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        {children}
      </div>
    </div>);

}

function NavBtn({ children, onClick, ghost = false }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: 'none', background: 'transparent',
      padding: '6px 0', color: ghost ? '#8a8a8a' : '#1c1c1c',
      fontSize: 13, fontWeight: 400, letterSpacing: '0.02em',
      fontFamily: 'inherit', cursor: 'pointer'
    }}>{children}</button>);

}

function PrimaryBtn({ children, onClick, disabled = false, full = true }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      appearance: 'none', border: 'none',
      background: disabled ? '#cdcac3' : '#1c1c1c',
      color: '#faf8f4', padding: '14px 22px',
      width: full ? '100%' : 'auto',
      borderRadius: 2, fontSize: 14, fontWeight: 500,
      letterSpacing: '0.06em', fontFamily: 'inherit',
      cursor: disabled ? 'default' : 'pointer',
      textAlign: 'center'
    }}>{children}</button>);

}

function GhostBtn({ children, onClick, full = true }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', background: 'transparent',
      color: '#1c1c1c', padding: '14px 22px',
      width: full ? '100%' : 'auto',
      border: '1px solid #d8d6d2', borderRadius: 2,
      fontSize: 13, fontWeight: 500, letterSpacing: '0.06em',
      fontFamily: 'inherit', cursor: 'pointer'
    }}>{children}</button>);

}

function SectionTitle({ kicker, children, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '20px 22px 10px'
    }}>
      <div>
        {kicker &&
        <div style={{
          fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
          textTransform: 'uppercase', marginBottom: 4
        }}>{kicker}</div>
        }
        <div style={{
          fontFamily: '"Cormorant Garamond", "Noto Sans JP", serif',
          fontSize: 22, fontWeight: 500, letterSpacing: '0.01em',
          color: '#1c1c1c'
        }}>{children}</div>
      </div>
      {action}
    </div>);

}

function CategoryGlyph({ category, size = 32, color = '#1c1c1c' }) {
  const sw = 1.2;
  if (category === 'pants') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M9 6 L23 6 L24 14 L21 28 L18 28 L16 16 L14 28 L11 28 L8 14 Z"
        stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="9" y1="9" x2="23" y2="9" stroke={color} strokeWidth={sw} />
      </svg>);

  }
  if (category === 'tops') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M11 7 Q16 5 21 7 L26 11 L24 14 L22 13 L22 26 L10 26 L10 13 L8 14 L6 11 Z"
        stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M13 6 Q16 9 19 6" stroke={color} strokeWidth={sw} fill="none" />
      </svg>);

  }
  if (category === 'outer') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M10 6 L22 6 L27 10 L26 18 L23 17 L23 28 L9 28 L9 17 L6 18 L5 10 Z"
        stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="16" y1="6" x2="16" y2="28" stroke={color} strokeWidth={sw} strokeDasharray="1.5 2" />
      </svg>);

  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────────────────────
function HomeScreen({ wardrobe, history, onCompare, onSetup, onItem, onHistory }) {
  const counts = {
    pants: wardrobe.filter((w) => w.category === 'pants').length,
    tops: wardrobe.filter((w) => w.category === 'tops').length,
    outer: wardrobe.filter((w) => w.category === 'outer').length
  };

  return (
    <Chrome
      title="fitto"
      leading={<NavBtn ghost>―</NavBtn>}
      trailing={<NavBtn onClick={onSetup}>設定</NavBtn>}>
      
      {/* hero */}
      <div style={{ padding: '4px 22px 24px' }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.22em', color: '#8a8a8a',
          textTransform: 'uppercase', marginBottom: 14
        }}></div>
        <div style={{
          fontFamily: '"Cormorant Garamond", "Noto Sans JP", serif',
          fontSize: 30, lineHeight: 1.25, fontWeight: 500,
          color: '#1c1c1c', marginBottom: 6
        }}>
          <br />
          
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: '#4a4a4a', marginBottom: 22 }}>
          ジャストサイズと比べて、本当にちょうどいいかを判定します。
        </div>
        <PrimaryBtn onClick={onCompare}>サイズを比較する</PrimaryBtn>
      </div>

      {/* wardrobe summary */}
      <SectionTitle
        kicker="Just size"
        action={<NavBtn ghost onClick={onSetup}>すべて</NavBtn>}>
        ジャストの基準</SectionTitle>

      <div style={{ padding: '0 22px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {wardrobe.filter((w) => w.primary).map((w) =>
        <button key={w.id} onClick={() => onItem(w)} style={{
          appearance: 'none', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 14px', background: '#ffffff',
          border: '1px solid #e8e6e2', borderRadius: 2,
          cursor: 'pointer', fontFamily: 'inherit'
        }}>
            <div style={{
            width: 48, height: 48, background: '#f3f0ea',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
              <CategoryGlyph category={w.category} size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1c1c1c', marginBottom: 2 }}>
                {w.name}
              </div>
              <div style={{ fontSize: 11, color: '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {w.brand} · size {w.sizeLabel}
              </div>
            </div>
            <div style={{ fontSize: 18, color: '#cdcac3', marginLeft: 8 }}>›</div>
          </button>
        )}
      </div>

      {/* category counts strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1,
        margin: '14px 22px 4px', background: '#e8e6e2', border: '1px solid #e8e6e2'
      }}>
        {Object.values(CATEGORIES).map((c) =>
        <div key={c.id} style={{
          background: '#faf8f4', padding: '14px 8px', textAlign: 'center'
        }}>
            <CategoryGlyph category={c.id} size={26} color="#4a4a4a" />
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#8a8a8a', marginTop: 4 }}>
              {c.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2, color: '#1c1c1c',
            fontFamily: '"Cormorant Garamond", serif' }}>
              {counts[c.id]}<span style={{ fontSize: 11, color: '#8a8a8a', marginLeft: 2 }}>着</span>
            </div>
          </div>
        )}
      </div>

      {/* history */}
      <SectionTitle kicker="History"
      action={history.length > 0 ? <NavBtn ghost onClick={onHistory}>すべて</NavBtn> : null}>
        最近の比較</SectionTitle>

      <div style={{ padding: '0 22px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {history.length === 0 &&
        <div style={{ fontSize: 12, color: '#8a8a8a', padding: '8px 0', lineHeight: 1.7 }}>
            まだ比較した服はありません。
          </div>
        }
        {history.slice(0, 4).map((h) =>
        <div key={h.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderBottom: '1px solid #ececec'
        }}>
            <div style={{
            width: 36, height: 36, background: '#f3f0ea',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <CategoryGlyph category={h.category} size={22} color="#4a4a4a" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1c' }}>{h.brand} — {h.product}</div>
              <div style={{ fontSize: 10, color: '#8a8a8a' }}>{h.date} · 基準: {h.baseName}</div>
            </div>
            <VerdictPill tone={h.tone} small>{h.label}</VerdictPill>
          </div>
        )}
      </div>
    </Chrome>);

}

function VerdictPill({ tone, small = false, children }) {
  const palette = {
    ok: { bg: '#1c1c1c', fg: '#faf8f4', border: '#1c1c1c' },
    soft: { bg: '#f3f0ea', fg: '#1c1c1c', border: '#cdcac3' },
    warn: { bg: '#fbf3ee', fg: '#b86a4a', border: '#e8c7b6' },
    bad: { bg: '#1c1c1c', fg: '#e8a48a', border: '#1c1c1c' },
    neutral: { bg: '#f3f0ea', fg: '#8a8a8a', border: '#e8e6e2' }
  }[tone] || { bg: '#f3f0ea', fg: '#1c1c1c', border: '#cdcac3' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: small ? '3px 10px' : '6px 14px',
      background: palette.bg, color: palette.fg,
      border: `1px solid ${palette.border}`, borderRadius: 999,
      fontSize: small ? 10 : 11, fontWeight: 500, letterSpacing: '0.06em',
      whiteSpace: 'nowrap'
    }}>{children}</span>);

}

window.fittoUI = {
  Chrome, NavBtn, PrimaryBtn, GhostBtn, SectionTitle, CategoryGlyph, VerdictPill
};
window.fittoScreens = window.fittoScreens || {};
window.fittoScreens.HomeScreen = HomeScreen;