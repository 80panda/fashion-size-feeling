// screens-compare.jsx — buy candidate input + base-garment picker

const { CATEGORIES, estimateField } = window.fittoData;

function CompareInputScreen({ wardrobe, draft, setDraft, onBack, onCompute }) {
  const { Chrome, NavBtn, PrimaryBtn, CategoryGlyph, FieldLabel, TextField } = window.fittoUI;
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [aiFilledKeys, setAiFilledKeys] = React.useState({});

  const update = (patch) => setDraft({ ...draft, ...patch });
  const updateMeasure = (k, v) => {
    const num = v === '' ? undefined : parseFloat(v);
    update({ measures: { ...draft.measures, [k]: isNaN(num) ? undefined : num } });
    // user-edited → no longer "AI-filled"
    if (aiFilledKeys[k]) {
      const next = { ...aiFilledKeys };
      delete next[k];
      setAiFilledKeys(next);
    }
  };

  const onAIResult = (result, selectedSize) => {
    let nextDraft = { ...draft };
    if (result.category && result.category !== draft.category) {
      nextDraft.category = result.category;
      nextDraft.measures = {};
    }
    nextDraft.measures = { ...(nextDraft.measures || {}), ...selectedSize.measures };
    if (selectedSize.sizeLabel) nextDraft.sizeLabel = selectedSize.sizeLabel;
    setDraft(nextDraft);
    setAiFilledKeys(Object.fromEntries(Object.keys(selectedSize.measures).map(k => [k, true])));
    setPasteOpen(false);
  };

  const cat = CATEGORIES[draft.category];

  // Available base garments for this category, primary first
  const bases = wardrobe
    .filter(w => w.category === draft.category)
    .sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));

  const baseId = draft.baseId || bases[0]?.id;
  React.useEffect(() => {
    if (!draft.baseId && bases[0]) update({ baseId: bases[0].id });
  // eslint-disable-next-line
  }, [draft.category]);

  // Estimation suggestions for missing fields
  const suggestions = cat.fields
    .filter(f => draft.measures?.[f.key] === undefined || draft.measures?.[f.key] === null)
    .map(f => ({
      ...f,
      estimate: estimateField(draft.category, f.key, draft.measures || {}),
    }))
    .filter(s => s.estimate !== null);

  const filledCount = cat.fields.filter(f => draft.measures?.[f.key] != null).length;
  const canCompute = filledCount >= 2 && baseId;

  return (
    <>
    <Chrome
      title="サイズを入力"
      leading={<NavBtn onClick={onBack}>‹ 戻る</NavBtn>}
      trailing={
        <NavBtn ghost onClick={() => update({ measures: {}, brand: '', product: '', sizeLabel: '' })}>
          クリア
        </NavBtn>
      }
    >
      {/* Category picker */}
      <div style={{ padding: '8px 22px 16px' }}>
        <FieldLabel>欲しい服</FieldLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1,
          background: '#e8e6e2', border: '1px solid #e8e6e2', marginBottom: 16,
        }}>
          {Object.values(CATEGORIES).map(c => {
            const sel = draft.category === c.id;
            return (
              <button key={c.id}
                onClick={() => update({ category: c.id, measures: {}, baseId: null })}
                style={{
                  appearance: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 8px',
                  background: sel ? '#1c1c1c' : '#faf8f4',
                  color: sel ? '#faf8f4' : '#1c1c1c',
                  fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                <CategoryGlyph category={c.id} size={22} color={sel ? '#faf8f4' : '#1c1c1c'} />
                <span style={{ fontSize: 11, letterSpacing: '0.06em' }}>{c.label}</span>
              </button>
            );
          })}
        </div>

        <TextField label="ブランド・商品名" placeholder="例：Lemaire — Twisted Pants"
          value={draft.brand || ''} onChange={v => update({ brand: v })} />
        <TextField label="サイズ表記" placeholder="例：46, M"
          value={draft.sizeLabel || ''} onChange={v => update({ sizeLabel: v })} />

        {/* AI paste */}
        <button onClick={() => setPasteOpen(true)} style={{
          appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
          width: '100%', padding: '12px 14px', marginTop: 6,
          background: '#ffffff', border: '1px dashed #cdcac3', borderRadius: 2,
          color: '#1c1c1c', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#1c1c1c', color: '#faf8f4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontFamily: '"Cormorant Garamond", serif',
          }}>AI</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500 }}>サイズ表を貼り付けて自動入力</span>
            <span style={{ display: 'block', fontSize: 10, color: '#8a8a8a', marginTop: 2 }}>
              ECサイトのサイズ表をコピペすると、項目を読み取ります
            </span>
          </span>
          <span style={{ fontSize: 14, color: '#cdcac3' }}>›</span>
        </button>
      </div>

      {/* Base picker */}
      <div style={{ padding: '0 22px 16px' }}>
        <FieldLabel>比べる相手（基準）</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bases.length === 0 && (
            <div style={{
              padding: 14, border: '1px dashed #d8d6d2',
              fontSize: 12, color: '#8a8a8a', textAlign: 'center',
            }}>
              このカテゴリの基準が未登録です。設定から登録してください。
            </div>
          )}
          {bases.map(b => {
            const sel = baseId === b.id;
            return (
              <button key={b.id} onClick={() => update({ baseId: b.id })} style={{
                appearance: 'none', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', cursor: 'pointer',
                background: sel ? '#1c1c1c' : '#ffffff',
                color: sel ? '#faf8f4' : '#1c1c1c',
                border: `1px solid ${sel ? '#1c1c1c' : '#e8e6e2'}`,
                fontFamily: 'inherit',
              }}>
                <span style={{ fontSize: 12, opacity: sel ? 1 : 0.6 }}>{b.primary ? '★' : '·'}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{b.name}</span>
                  <span style={{ display: 'block', fontSize: 10,
                    color: sel ? 'rgba(250,248,244,0.7)' : '#8a8a8a' }}>
                    {b.brand} · size {b.sizeLabel}
                  </span>
                </span>
                <span style={{ fontSize: 16, opacity: 0.5 }}>{sel ? '●' : '○'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Measurements input */}
      <div style={{ padding: '0 22px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <FieldLabel>商品の寸法（cm）</FieldLabel>
          <div style={{ fontSize: 10, color: '#8a8a8a' }}>
            {filledCount}/{cat.fields.length} 入力済
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #ececec' }}>
          {cat.fields.map((f, i) => {
            const v = draft.measures?.[f.key];
            const missing = v == null;
            const est = missing ? estimateField(draft.category, f.key, draft.measures || {}) : null;
            return (
              <div key={f.key} style={{
                display: 'flex', alignItems: 'center', padding: '12px 14px',
                borderBottom: i < cat.fields.length - 1 ? '1px solid #f0eee9' : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: '1px solid #d8d6d2', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: '#8a8a8a', marginRight: 12,
                  fontFamily: '"Cormorant Garamond", serif',
                }}>{f.short}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#1c1c1c', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {f.ja}
                    {aiFilledKeys[f.key] && (
                      <span style={{
                        fontSize: 9, letterSpacing: '0.1em', color: '#1c1c1c',
                        border: '1px solid #1c1c1c', padding: '1px 5px',
                        fontFamily: '"Cormorant Garamond", serif',
                      }}>AI</span>
                    )}
                  </div>
                  {missing && est != null && (
                    <button onClick={() => updateMeasure(f.key, est)} style={{
                      appearance: 'none', border: 'none', background: 'transparent',
                      padding: '2px 0', marginTop: 2, cursor: 'pointer',
                      fontSize: 10, color: '#b86a4a', fontFamily: 'inherit',
                    }}>推定 {est}cm を使う ›</button>
                  )}
                </div>
                <input
                  type="number" inputMode="decimal" step="0.5"
                  value={v ?? ''}
                  onChange={(e) => updateMeasure(f.key, e.target.value)}
                  placeholder="—"
                  style={{
                    width: 72, textAlign: 'right',
                    border: 'none', borderBottom: '1px solid #d8d6d2',
                    background: 'transparent', padding: '4px 4px',
                    fontSize: 14, fontFamily: 'inherit',
                    fontVariantNumeric: 'tabular-nums',
                    color: '#1c1c1c', outline: 'none',
                  }}
                />
                <div style={{ width: 22, fontSize: 11, color: '#8a8a8a', textAlign: 'right' }}>cm</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimation suggestions card */}
      {suggestions.length > 0 && filledCount >= 2 && (
        <div style={{ margin: '14px 22px 8px', padding: '14px',
                      background: '#fbf6f0', border: '1px solid #f1e2d3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>◇</span>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', color: '#b86a4a',
                          textTransform: 'uppercase', fontWeight: 500 }}>
              推定で補完できます
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#4a4a4a', lineHeight: 1.7, marginBottom: 10 }}>
            ECサイトに記載がない項目は、入力済の値から目安を推定できます。
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map(s => (
              <button key={s.key} onClick={() => updateMeasure(s.key, s.estimate)} style={{
                appearance: 'none', border: '1px solid #e8c7b6',
                background: '#ffffff', color: '#b86a4a',
                padding: '6px 12px', fontSize: 11, cursor: 'pointer',
                borderRadius: 999, fontFamily: 'inherit',
              }}>
                {s.ja} ≈ {s.estimate}cm
              </button>
            ))}
            <button onClick={() => {
              const next = { ...(draft.measures || {}) };
              suggestions.forEach(s => { next[s.key] = s.estimate; });
              update({ measures: next });
            }} style={{
              appearance: 'none', border: 'none',
              background: '#1c1c1c', color: '#faf8f4',
              padding: '6px 12px', fontSize: 11, cursor: 'pointer',
              borderRadius: 999, fontFamily: 'inherit',
            }}>すべて補完</button>
          </div>
        </div>
      )}

      <div style={{ padding: '14px 22px 28px' }}>
        <PrimaryBtn onClick={onCompute} disabled={!canCompute}>
          このサイズで判定する
        </PrimaryBtn>
      </div>
    </Chrome>
    {pasteOpen && (
      <PasteSizeTableModal
        hintCategory={draft.category}
        onClose={() => setPasteOpen(false)}
        onResult={onAIResult}
      />
    )}
    </>
  );
}

// Wrap return in fragment — adjust function signature
// (we need to convert the single-return Chrome to a Fragment with modal)

// ─────────────────────────────────────────────────────────────
// Paste-size-table modal
// ─────────────────────────────────────────────────────────────
function PasteSizeTableModal({ hintCategory, onClose, onResult }) {
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [selectedIdx, setSelectedIdx] = React.useState(0);

  const onParse = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null); setPreview(null);
    try {
      const result = await window.fittoLLM.parseSizeTable(text, hintCategory);
      setPreview(result);
      setSelectedIdx(0);
    } catch (e) {
      setError(e.message || '読み取りに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fieldJa = {
    waist: 'ウエスト', hip: 'ヒップ', thigh: 'もも幅', rise: '股上', hem: '裾幅', inseam: '股下',
    shoulder: '肩幅', chest: '身幅', length: '着丈', sleeve: '袖丈', cuff: '袖口', neck: '首回り',
  };
  const catLabel = { pants: 'ボトムス', tops: 'トップス', outer: 'アウター' };

  const selected = preview?.sizes?.[selectedIdx];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(28,28,28,0.45)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', background: '#faf8f4',
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '14px 18px 22px',
        animation: 'fitto-fade 220ms ease',
        maxHeight: '92%', overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#1c1c1c', color: '#faf8f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontFamily: '"Cormorant Garamond", serif',
            }}>AI</span>
            <div style={{
              fontFamily: '"Cormorant Garamond", "Noto Sans JP", serif',
              fontSize: 18, fontWeight: 500, color: '#1c1c1c',
            }}>サイズ表を貼り付け</div>
          </div>
          <button onClick={onClose} style={{
            appearance: 'none', border: 'none', background: 'transparent',
            fontSize: 13, color: '#8a8a8a', cursor: 'pointer', padding: 4,
          }}>閉じる</button>
        </div>
        <div style={{ fontSize: 11, color: '#4a4a4a', lineHeight: 1.7, marginBottom: 10 }}>
          ECサイトのサイズ表（表組みでも、行ごとでもOK）をペーストしてください。
          項目名と数値を読み取って自動で入力します。
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={'例：\nサイズ  ウエスト  ヒップ  股上  股下  もも幅  裾幅\nS      78      101    26    60    29    15.5\nM      82      105    26.5  62    30    16'}
          style={{
            width: '100%', minHeight: 140, padding: '10px 12px',
            border: '1px solid #e8e6e2', borderRadius: 2,
            fontSize: 12, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            color: '#1c1c1c', background: '#ffffff', resize: 'vertical', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <div style={{
            marginTop: 10, padding: '10px 12px',
            background: '#fbf3ee', border: '1px solid #e8c7b6',
            color: '#b86a4a', fontSize: 11, lineHeight: 1.6,
          }}>{error}</div>
        )}
        {preview && (
          <div style={{
            marginTop: 12, padding: '12px 14px',
            background: '#ffffff', border: '1px solid #ececec',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
                textTransform: 'uppercase' }}>読み取り結果</div>
              <div style={{ flex: 1, height: 1, background: '#e8e6e2' }} />
              <div style={{ fontSize: 10, color: '#8a8a8a' }}>信頼度: {preview.confidence}</div>
            </div>
            <div style={{ fontSize: 12, color: '#1c1c1c', marginBottom: 10 }}>
              <span style={{ color: '#8a8a8a' }}>カテゴリ: </span>{catLabel[preview.category]}
            </div>
            {preview.sizes.length > 1 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#8a8a8a',
                  textTransform: 'uppercase', marginBottom: 6 }}>使うサイズを選択</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {preview.sizes.map((s, i) => {
                    const sel = selectedIdx === i;
                    return (
                      <button key={i} onClick={() => setSelectedIdx(i)} style={{
                        appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        padding: '6px 14px', fontSize: 12, fontWeight: 500,
                        background: sel ? '#1c1c1c' : '#ffffff',
                        color: sel ? '#faf8f4' : '#1c1c1c',
                        border: `1px solid ${sel ? '#1c1c1c' : '#d8d6d2'}`,
                        borderRadius: 999,
                      }}>{s.sizeLabel || `#${i+1}`}{s.isRange && <span style={{ marginLeft: 4, opacity: 0.6, fontSize: 10 }}>±</span>}</button>
                    );
                  })}
                </div>
              </div>
            )}
            {selected && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {Object.entries(selected.measures).map(([k, v]) => (
                  <span key={k} style={{
                    fontSize: 11, padding: '4px 10px',
                    background: '#f3f0ea', color: '#1c1c1c',
                    borderRadius: 999,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{fieldJa[k] || k} {v}cm</span>
                ))}
                {Object.keys(selected.measures).length === 0 && (
                  <span style={{ fontSize: 11, color: '#b86a4a' }}>項目を読み取れませんでした</span>
                )}
              </div>
            )}
            {preview.notes && (
              <div style={{ fontSize: 10, color: '#8a8a8a', lineHeight: 1.6 }}>※ {preview.notes}</div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{
            appearance: 'none', cursor: 'pointer', flex: 1,
            background: 'transparent', color: '#1c1c1c',
            border: '1px solid #d8d6d2', borderRadius: 2,
            padding: '12px 16px', fontSize: 13, fontFamily: 'inherit',
          }}>キャンセル</button>
          {!preview ? (
            <button onClick={onParse} disabled={loading || !text.trim()} style={{
              appearance: 'none', cursor: loading ? 'default' : 'pointer', flex: 2,
              background: loading || !text.trim() ? '#cdcac3' : '#1c1c1c',
              color: '#faf8f4', border: 'none', borderRadius: 2,
              padding: '12px 16px', fontSize: 13, fontWeight: 500,
              letterSpacing: '0.06em', fontFamily: 'inherit',
            }}>{loading ? '読み取り中…' : 'AIで読み取る'}</button>
          ) : (
            <button onClick={() => onResult(preview, selected)}
              disabled={!selected || Object.keys(selected.measures).length === 0} style={{
              appearance: 'none', cursor: 'pointer', flex: 2,
              background: !selected || Object.keys(selected.measures).length === 0 ? '#cdcac3' : '#1c1c1c',
              color: '#faf8f4', border: 'none', borderRadius: 2,
              padding: '12px 16px', fontSize: 13, fontWeight: 500,
              letterSpacing: '0.06em', fontFamily: 'inherit',
            }}>このサイズで入力する</button>
          )}
        </div>
      </div>
    </div>
  );
}

window.fittoScreens = window.fittoScreens || {};
window.fittoScreens.CompareInputScreen = CompareInputScreen;
