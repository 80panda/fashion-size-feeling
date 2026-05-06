// screens-result.jsx — comparison result with 3 verdict UI variants

const { CATEGORIES, compareItem, verdict, TOLERANCE } = window.fittoData;
const { FigureCompare } = window.fittoFigure;

function ResultScreen({ base, candidate, judgementUI, showLabels, onBack, onSave, onChangeBase }) {
  const { Chrome, NavBtn, PrimaryBtn, GhostBtn, VerdictPill } = window.fittoUI;
  const cat = CATEGORIES[candidate.category];
  const rows = compareItem(base, candidate);
  const v = verdict(rows);

  return (
    <Chrome
      title="比較結果"
      leading={<NavBtn onClick={onBack}>‹ 戻る</NavBtn>}
      trailing={<NavBtn ghost onClick={onSave}>保存</NavBtn>}
    >
      {/* Header: which vs which */}
      <div style={{ padding: '6px 22px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 8,
          fontSize: 11, color: '#8a8a8a',
        }}>
          <button onClick={onChangeBase} style={{
            appearance: 'none', border: '1px solid #e8e6e2', background: '#ffffff',
            flex: 1, padding: '10px 12px', textAlign: 'left',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#8a8a8a', textTransform: 'uppercase' }}>BASE ★</div>
            <div style={{ fontSize: 12, color: '#1c1c1c', fontWeight: 500, marginTop: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {base.name}
            </div>
            <div style={{ fontSize: 10, color: '#8a8a8a',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {base.brand} · {base.sizeLabel}
            </div>
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, fontSize: 18, color: '#cdcac3',
            fontFamily: '"Cormorant Garamond", serif',
          }}>↔</div>
          <div style={{
            background: '#1c1c1c', color: '#faf8f4',
            flex: 1, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.18em',
              color: 'rgba(250,248,244,0.6)', textTransform: 'uppercase' }}>CANDIDATE</div>
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {candidate.brand || '商品名未設定'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(250,248,244,0.6)' }}>
              size {candidate.sizeLabel || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Figure with callouts */}
      <div style={{
        margin: '4px 12px 0', padding: '8px 0',
        background: '#fbfaf6', borderTop: '1px solid #ececec', borderBottom: '1px solid #ececec',
        position: 'relative',
      }}>
        <FigureCompare category={candidate.category} rows={rows} showLabels={showLabels} height={360} />
        {/* recommended size pill (mimics reference) */}
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#8a8a8a',
            textTransform: 'uppercase' }}>Verdict</div>
          <VerdictPill tone={v.tone}>{v.label}</VerdictPill>
        </div>
      </div>

      {/* Variant: judgement UI */}
      <div style={{ padding: '18px 22px 4px' }}>
        {judgementUI === 'label' && <VerdictLabelView v={v} candidate={candidate} base={base} />}
        {judgementUI === 'score' && <VerdictScoreView v={v} rows={rows} />}
        {judgementUI === 'breakdown' && <VerdictBreakdownView v={v} rows={rows} cat={cat} />}
        {(judgementUI === 'all' || !judgementUI) && (
          <>
            <VerdictLabelView v={v} candidate={candidate} base={base} compact />
            <VerdictScoreView v={v} rows={rows} compact />
            <VerdictBreakdownView v={v} rows={rows} cat={cat} />
          </>
        )}
      </div>

      <div style={{ padding: '20px 22px 28px', display: 'flex', gap: 10 }}>
        <GhostBtn onClick={onBack}>サイズを直す</GhostBtn>
        <PrimaryBtn onClick={onSave}>保存して戻る</PrimaryBtn>
      </div>
    </Chrome>
  );
}

// ─────────────────────────────────────────────────────────────
// Variant A: Label-centric verdict
// ─────────────────────────────────────────────────────────────
function VerdictLabelView({ v, candidate, base, compact = false }) {
  const { VerdictPill } = window.fittoUI;
  const conf = v.score == null ? '—' :
    v.score >= 88 ? '高' : v.score >= 70 ? '中' : '低';
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #ececec',
      padding: compact ? '14px 16px' : '20px 18px',
      marginBottom: compact ? 12 : 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
          textTransform: 'uppercase' }}>判定</div>
        <div style={{ flex: 1, height: 1, background: '#e8e6e2' }} />
        <div style={{ fontSize: 10, color: '#8a8a8a' }}>信頼度 {conf}</div>
      </div>
      <div style={{
        fontFamily: '"Cormorant Garamond", "Noto Sans JP", serif',
        fontSize: compact ? 28 : 36, fontWeight: 500, lineHeight: 1.1,
        color: '#1c1c1c', marginBottom: 8,
      }}>{v.label}</div>
      <div style={{ fontSize: 12, lineHeight: 1.7, color: '#4a4a4a', marginBottom: 10 }}>
        {v.summary}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {v.tightCount > 0 && <VerdictPill tone="warn" small>タイト {v.tightCount}箇所</VerdictPill>}
        {v.looseCount > 0 && <VerdictPill tone="soft" small>ゆとり {v.looseCount}箇所</VerdictPill>}
        {v.majorCount > 0 && <VerdictPill tone="bad" small>差大 {v.majorCount}箇所</VerdictPill>}
        {v.tightCount === 0 && v.looseCount === 0 && (
          <VerdictPill tone="ok" small>全項目ジャスト</VerdictPill>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Variant B: Score-centric verdict
// ─────────────────────────────────────────────────────────────
function VerdictScoreView({ v, rows, compact = false }) {
  const score = v.score ?? 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const tone = v.tone;
  const stroke = tone === 'ok' ? '#1c1c1c'
    : tone === 'soft' ? '#6b7c5a'
    : tone === 'warn' ? '#b86a4a'
    : tone === 'bad' ? '#8a3a1c' : '#cdcac3';

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #ececec',
      padding: compact ? '14px 16px' : '20px 18px',
      marginBottom: compact ? 12 : 0,
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <div style={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
        <svg width="92" height="92" viewBox="0 0 92 92">
          <circle cx="46" cy="46" r={r} fill="none" stroke="#ececec" strokeWidth="3" />
          <circle cx="46" cy="46" r={r} fill="none" stroke={stroke} strokeWidth="3"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="butt"
            transform="rotate(-90 46 46)" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}>
          <div style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 30, fontWeight: 500, color: '#1c1c1c', lineHeight: 1,
          }}>{score}</div>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', color: '#8a8a8a',
            textTransform: 'uppercase', marginTop: 2 }}>fit score</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
          textTransform: 'uppercase', marginBottom: 4 }}>スコア内訳</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ScoreBar label="ジャスト" count={rows.filter(r => r.status === 'fit').length}
                    total={rows.filter(r => r.diff != null).length} color="#1c1c1c" />
          <ScoreBar label="ゆとり" count={rows.filter(r => r.diff != null && r.diff > TOLERANCE[r.key]?.fit).length}
                    total={rows.filter(r => r.diff != null).length} color="#6b7c5a" />
          <ScoreBar label="タイト" count={rows.filter(r => r.diff != null && r.diff < -TOLERANCE[r.key]?.fit).length}
                    total={rows.filter(r => r.diff != null).length} color="#b86a4a" />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, count, total, color }) {
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 50, fontSize: 10, color: '#4a4a4a' }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: '#f3f0ea', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: color }} />
      </div>
      <div style={{ width: 24, fontSize: 10, color: '#8a8a8a', textAlign: 'right',
        fontVariantNumeric: 'tabular-nums' }}>{count}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Variant C: Per-field breakdown table
// ─────────────────────────────────────────────────────────────
function VerdictBreakdownView({ v, rows, cat }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #ececec',
    }}>
      <div style={{
        padding: '12px 16px 10px', borderBottom: '1px solid #ececec',
        display: 'flex', alignItems: 'baseline', gap: 10,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
          textTransform: 'uppercase' }}>項目別の差分</div>
        <div style={{ flex: 1, height: 1, background: '#e8e6e2' }} />
        <div style={{ fontSize: 10, color: '#8a8a8a' }}>
          {v.valid}/{cat.fields.length}項目
        </div>
      </div>
      {rows.map((r, i) => (
        <BreakdownRow key={r.key} r={r} last={i === rows.length - 1} />
      ))}
    </div>
  );
}

function BreakdownRow({ r, last }) {
  const tol = TOLERANCE[r.key] || { fit: 2, loose: 4, major: 7 };
  const labelMap = {
    'fit': { ja: 'ジャスト', tone: 'ok' },
    'slightly-loose': { ja: 'ややゆるい', tone: 'soft' },
    'slightly-tight': { ja: 'ややタイト', tone: 'soft' },
    'loose': { ja: 'ゆるい', tone: 'warn' },
    'tight': { ja: 'タイト', tone: 'warn' },
    'too-loose': { ja: '差大（ゆるい）', tone: 'bad' },
    'too-tight': { ja: '差大（タイト）', tone: 'bad' },
    'missing': { ja: 'データなし', tone: 'neutral' },
  };
  const tag = labelMap[r.status] || labelMap.missing;
  const colorMap = {
    ok: '#1c1c1c', soft: '#6b7c5a', warn: '#b86a4a', bad: '#8a3a1c', neutral: '#cdcac3',
  };
  const dotColor = colorMap[tag.tone];

  // Diff bar position: -major..+major mapped to 0..100%
  const range = tol.major + 2;
  const pct = r.diff == null ? 50 : Math.max(0, Math.min(100, 50 + (r.diff / range) * 50));

  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: last ? 'none' : '1px solid #f0eee9',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          border: '1px solid #d8d6d2', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: '#8a8a8a',
          fontFamily: '"Cormorant Garamond", serif',
        }}>{r.short}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1c' }}>{r.ja}</div>
        {r.estimated && (
          <span style={{
            fontSize: 9, letterSpacing: '0.1em', color: '#b86a4a',
            border: '1px solid #e8c7b6', padding: '1px 5px',
          }}>推定</span>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: '#8a8a8a' }}>
          {r.base ?? '—'}<span style={{ margin: '0 4px' }}>→</span>
          <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{r.target ?? '—'}</span>
          <span style={{ marginLeft: 4 }}>cm</span>
        </div>
      </div>

      {/* Diff bar */}
      <div style={{
        position: 'relative', height: 4, background: '#f3f0ea',
        marginLeft: 32, marginRight: 0, marginBottom: 6,
      }}>
        {/* zero center */}
        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2,
          width: 1, background: '#cdcac3' }} />
        {/* fit zone */}
        <div style={{ position: 'absolute', top: 0, bottom: 0,
          left: `${50 - (tol.fit / range) * 50}%`,
          width: `${(tol.fit * 2 / range) * 50}%`,
          background: '#e8e6e2',
        }} />
        {/* indicator */}
        {r.diff != null && (
          <div style={{
            position: 'absolute', top: -3, height: 10, width: 2,
            left: `${pct}%`, transform: 'translateX(-1px)',
            background: dotColor,
          }} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 32 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: dotColor,
        }} />
        <span style={{ fontSize: 11, color: '#1c1c1c' }}>{tag.ja}</span>
        {r.diff != null && (
          <span style={{ fontSize: 11, color: '#8a8a8a',
            fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>
            {r.diff > 0 ? '+' : ''}{r.diff.toFixed(1)}cm
          </span>
        )}
      </div>
    </div>
  );
}

window.fittoScreens = window.fittoScreens || {};
window.fittoScreens.ResultScreen = ResultScreen;
