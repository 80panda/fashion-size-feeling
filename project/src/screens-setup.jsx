// screens-setup.jsx — wardrobe / just-size setup

const { CATEGORIES } = window.fittoData;
const { FigureSimple } = window.fittoFigure;

// ─────────────────────────────────────────────────────────────
// SetupListScreen — list of registered just-size garments
// ─────────────────────────────────────────────────────────────
function SetupListScreen({ wardrobe, onBack, onAdd, onEdit, onTogglePrimary }) {
  const { Chrome, NavBtn, PrimaryBtn, CategoryGlyph } = window.fittoUI;

  // Group by category
  const groups = ['pants', 'tops', 'outer'].map(cat => ({
    cat,
    items: wardrobe.filter(w => w.category === cat),
  }));

  return (
    <Chrome
      title="ジャストサイズ"
      leading={<NavBtn onClick={onBack}>‹ 戻る</NavBtn>}
      trailing={<NavBtn onClick={onAdd}>＋ 追加</NavBtn>}
    >
      <div style={{ padding: '4px 22px 12px' }}>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: '#4a4a4a' }}>
          基準にする一着を、カテゴリごとに登録しておきます。<br/>
          ★印が比較時のデフォルト基準です。
        </div>
      </div>

      {groups.map(g => (
        <div key={g.cat}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '20px 22px 8px',
          }}>
            <CategoryGlyph category={g.cat} size={20} color="#8a8a8a" />
            <div style={{
              fontSize: 11, letterSpacing: '0.18em', color: '#8a8a8a',
              textTransform: 'uppercase',
            }}>{CATEGORIES[g.cat].labelEn}</div>
            <div style={{ flex: 1, height: 1, background: '#e8e6e2' }} />
          </div>

          <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {g.items.map(w => (
              <div key={w.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 14px', background: '#ffffff',
                border: '1px solid #e8e6e2', borderRadius: 2,
              }}>
                <button onClick={() => onTogglePrimary(w.id)} style={{
                  appearance: 'none', border: 'none', background: 'transparent',
                  width: 24, height: 24, cursor: 'pointer', padding: 0,
                  color: w.primary ? '#1c1c1c' : '#cdcac3', fontSize: 14,
                }}>{w.primary ? '★' : '☆'}</button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1c1c1c' }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: '#8a8a8a' }}>
                    {w.brand} · size {w.sizeLabel}
                  </div>
                </div>
                <button onClick={() => onEdit(w)} style={{
                  appearance: 'none', border: 'none', background: 'transparent',
                  fontSize: 11, color: '#4a4a4a', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '4px 8px',
                }}>編集</button>
              </div>
            ))}
            {g.items.length === 0 && (
              <div style={{
                padding: '14px', border: '1px dashed #d8d6d2', borderRadius: 2,
                fontSize: 12, color: '#8a8a8a', textAlign: 'center',
              }}>未登録</div>
            )}
          </div>
        </div>
      ))}

      <div style={{ padding: '24px 22px 28px' }}>
        <PrimaryBtn onClick={onAdd}>＋ 新しく登録する</PrimaryBtn>
      </div>
    </Chrome>
  );
}

// ─────────────────────────────────────────────────────────────
// SetupEditScreen — add/edit a single just-size garment
// ─────────────────────────────────────────────────────────────
function SetupEditScreen({ initial, onBack, onSave }) {
  const { Chrome, NavBtn, PrimaryBtn, GhostBtn, CategoryGlyph } = window.fittoUI;
  const isNew = !initial?.id;
  const [draft, setDraft] = React.useState(() => initial || {
    id: 'w' + Date.now(),
    category: 'pants',
    name: '',
    brand: '',
    sizeLabel: '',
    primary: false,
    measures: {},
    note: '',
  });
  const [focusedField, setFocusedField] = React.useState(null);
  const cat = CATEGORIES[draft.category];

  const update = (patch) => setDraft(d => ({ ...d, ...patch }));
  const updateMeasure = (k, v) => {
    const num = v === '' ? undefined : parseFloat(v);
    setDraft(d => ({ ...d, measures: { ...d.measures, [k]: isNaN(num) ? undefined : num } }));
  };

  return (
    <Chrome
      title={isNew ? '新規登録' : '編集'}
      leading={<NavBtn onClick={onBack}>‹ 戻る</NavBtn>}
      trailing={<NavBtn onClick={() => onSave(draft)}>保存</NavBtn>}
    >
      {/* Category picker */}
      <div style={{ padding: '8px 22px 18px' }}>
        <FieldLabel>カテゴリ</FieldLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1,
          background: '#e8e6e2', border: '1px solid #e8e6e2',
        }}>
          {Object.values(CATEGORIES).map(c => {
            const sel = draft.category === c.id;
            return (
              <button key={c.id} onClick={() => update({ category: c.id, measures: {} })} style={{
                appearance: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 8px',
                background: sel ? '#1c1c1c' : '#faf8f4',
                color: sel ? '#faf8f4' : '#1c1c1c',
                fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <CategoryGlyph category={c.id} size={24} color={sel ? '#faf8f4' : '#1c1c1c'} />
                <span style={{ fontSize: 11, letterSpacing: '0.06em' }}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Figure preview */}
      <div style={{
        margin: '0 22px 14px', padding: '12px',
        background: '#fbfaf6', border: '1px solid #ececec',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 110, flexShrink: 0 }}>
          <FigureSimple category={draft.category} highlightField={focusedField} height={170} />
        </div>
        <div style={{ flex: 1, fontSize: 11, lineHeight: 1.7, color: '#4a4a4a' }}>
          {focusedField ? (
            <>
              <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#b86a4a', marginBottom: 4 }}>
                MEASURING
              </div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, color: '#1c1c1c' }}>
                {cat.fields.find(f => f.key === focusedField)?.ja}
              </div>
              <div style={{ fontSize: 11, color: '#8a8a8a', marginTop: 4 }}>
                平置きで測ったサイズを入力してください。
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#8a8a8a', marginBottom: 4 }}>
                {cat.labelEn.toUpperCase()}
              </div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, color: '#1c1c1c' }}>
                {cat.label}の寸法
              </div>
              <div style={{ fontSize: 11, color: '#8a8a8a', marginTop: 4 }}>
                数値の入力欄をタップすると、図の位置がハイライトされます。
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name + brand + size */}
      <div style={{ padding: '0 22px 4px' }}>
        <TextField label="呼び名" placeholder="例：ジャストパンツ" value={draft.name} onChange={v => update({ name: v })} />
        <TextField label="ブランド・型番" placeholder="例：A.P.C. Petit Standard" value={draft.brand} onChange={v => update({ brand: v })} />
        <TextField label="サイズ表記" placeholder="例：31, M, 4" value={draft.sizeLabel} onChange={v => update({ sizeLabel: v })} />
      </div>

      {/* Measurements */}
      <FieldLabel padded>寸法（cm）</FieldLabel>
      <div style={{
        margin: '0 22px 16px', border: '1px solid #ececec',
        background: '#ffffff',
      }}>
        {cat.fields.map((f, i) => (
          <div key={f.key} style={{
            display: 'flex', alignItems: 'center',
            padding: '12px 14px',
            borderBottom: i < cat.fields.length - 1 ? '1px solid #f0eee9' : 'none',
            background: focusedField === f.key ? '#fbf6f0' : '#ffffff',
            transition: 'background 120ms ease',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '1px solid #d8d6d2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#8a8a8a', marginRight: 12,
              fontFamily: '"Cormorant Garamond", serif',
            }}>{f.short}</div>
            <div style={{ flex: 1, fontSize: 13, color: '#1c1c1c' }}>{f.ja}</div>
            <input
              type="number" inputMode="decimal" step="0.5"
              value={draft.measures?.[f.key] ?? ''}
              onChange={(e) => updateMeasure(f.key, e.target.value)}
              onFocus={() => setFocusedField(f.key)}
              onBlur={() => setFocusedField(null)}
              placeholder="—"
              style={{
                width: 72, textAlign: 'right',
                border: 'none', borderBottom: '1px solid #d8d6d2',
                background: 'transparent', padding: '4px 4px',
                fontSize: 14, fontFamily: 'inherit',
                fontVariantNumeric: 'tabular-nums',
                outline: 'none',
              }}
            />
            <div style={{ width: 22, fontSize: 11, color: '#8a8a8a', textAlign: 'right' }}>cm</div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div style={{ padding: '0 22px' }}>
        <FieldLabel>メモ（任意）</FieldLabel>
        <textarea
          value={draft.note || ''}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="例：休日用にゆとりあり"
          style={{
            width: '100%', minHeight: 60, padding: '10px 12px',
            border: '1px solid #e8e6e2', borderRadius: 2,
            fontSize: 12, fontFamily: 'inherit', color: '#1c1c1c',
            background: '#ffffff', resize: 'none', outline: 'none',
          }}
        />
      </div>

      {/* Primary toggle */}
      <div style={{ padding: '14px 22px 8px' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: '#1c1c1c', cursor: 'pointer',
        }}>
          <input type="checkbox" checked={!!draft.primary}
                 onChange={(e) => update({ primary: e.target.checked })}
                 style={{ accentColor: '#1c1c1c', width: 16, height: 16 }} />
          このカテゴリの基準にする（★）
        </label>
      </div>

      <div style={{ padding: '14px 22px 28px' }}>
        <PrimaryBtn onClick={() => onSave(draft)}>保存する</PrimaryBtn>
      </div>
    </Chrome>
  );
}

function FieldLabel({ children, padded = false }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: '0.18em', color: '#8a8a8a',
      textTransform: 'uppercase', margin: padded ? '14px 22px 8px' : '12px 0 6px',
    }}>{children}</div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text" value={value || ''} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', border: 'none', borderBottom: '1px solid #d8d6d2',
          background: 'transparent', padding: '8px 2px',
          fontSize: 14, fontFamily: 'inherit', color: '#1c1c1c',
          outline: 'none',
        }}
      />
    </div>
  );
}

window.fittoScreens = window.fittoScreens || {};
window.fittoScreens.SetupListScreen = SetupListScreen;
window.fittoScreens.SetupEditScreen = SetupEditScreen;
window.fittoUI.FieldLabel = FieldLabel;
window.fittoUI.TextField = TextField;
