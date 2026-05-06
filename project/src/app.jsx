// app.jsx — root of the fitto prototype

const { DEFAULT_WARDROBE, SAMPLE_CANDIDATE_PANTS, CATEGORIES } = window.fittoData;
const { HomeScreen, SetupListScreen, SetupEditScreen, CompareInputScreen, ResultScreen } = window.fittoScreens;

// ─────────────────────────────────────────────────────────────
// Sample history (so the home screen isn't empty)
// ─────────────────────────────────────────────────────────────
const SAMPLE_HISTORY = [
  { id: 'h1', category: 'tops', brand: 'AURALEE', product: 'Brushed Knit',
    date: '5月 2日', baseName: 'ジャストTシャツ', label: 'ぴったり', tone: 'ok' },
  { id: 'h2', category: 'pants', brand: 'STUDIO NICHOLSON', product: 'Sorte Pant',
    date: '4月 28日', baseName: 'ジャストパンツ', label: '少しゆるめ', tone: 'soft' },
  { id: 'h3', category: 'outer', brand: 'LEMAIRE', product: 'Soft Coat',
    date: '4月 14日', baseName: 'ジャストコート', label: 'ゆるい', tone: 'warn' },
];

// ─────────────────────────────────────────────────────────────
// Slide transition wrapper
// ─────────────────────────────────────────────────────────────
function SlideStack({ screen, children }) {
  // simple fade+slide on key change; React handles unmount/mount
  return (
    <div key={screen} style={{
      width: '100%', height: '100%',
      animation: 'fitto-fade 220ms ease',
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  const [wardrobe, setWardrobe] = React.useState(DEFAULT_WARDROBE);
  const [history, setHistory]   = React.useState(SAMPLE_HISTORY);
  const [screen, setScreen]     = React.useState('home');
  // Pre-fill an example so first-time users see something
  const [draft, setDraft]       = React.useState({
    category: 'pants',
    brand: SAMPLE_CANDIDATE_PANTS.brand + ' — ' + SAMPLE_CANDIDATE_PANTS.product,
    sizeLabel: SAMPLE_CANDIDATE_PANTS.sizeLabel,
    baseId: 'w1',
    measures: { ...SAMPLE_CANDIDATE_PANTS.measures },
  });
  const [editTarget, setEditTarget] = React.useState(null);

  // Selected base for comparison
  const baseGarment = wardrobe.find(w => w.id === draft.baseId)
    || wardrobe.find(w => w.category === draft.category && w.primary)
    || wardrobe.find(w => w.category === draft.category);

  // Handlers
  const goHome     = () => setScreen('home');
  const goCompare  = () => setScreen('compare');
  const goResult   = () => setScreen('result');
  const goSetup    = () => setScreen('setup');

  const onAddItem = () => {
    setEditTarget(null);
    setScreen('edit');
  };
  const onEditItem = (item) => {
    setEditTarget(item);
    setScreen('edit');
  };
  const onSaveItem = (item) => {
    setWardrobe(ws => {
      const idx = ws.findIndex(w => w.id === item.id);
      let next;
      if (idx >= 0) {
        next = ws.slice();
        next[idx] = item;
      } else {
        next = [...ws, item];
      }
      // primary uniqueness per category
      if (item.primary) {
        next = next.map(w => w.category === item.category && w.id !== item.id
          ? { ...w, primary: false } : w);
      }
      return next;
    });
    setScreen('setup');
  };
  const onTogglePrimary = (id) => {
    setWardrobe(ws => {
      const target = ws.find(w => w.id === id);
      if (!target) return ws;
      return ws.map(w => {
        if (w.id === id) return { ...w, primary: !w.primary };
        if (w.category === target.category && !target.primary) return { ...w, primary: false };
        return w;
      });
    });
  };

  const onSaveResult = () => {
    const newH = {
      id: 'h' + Date.now(),
      category: draft.category,
      brand: (draft.brand || '').split(' — ')[0] || draft.brand || '無題',
      product: (draft.brand || '').split(' — ')[1] || draft.sizeLabel || '',
      date: '今日',
      baseName: baseGarment?.name || '',
      label: window.fittoData.verdict(window.fittoData.compareItem(baseGarment, draft)).label,
      tone: window.fittoData.verdict(window.fittoData.compareItem(baseGarment, draft)).tone,
    };
    setHistory(h => [newH, ...h]);
    setScreen('home');
  };

  // Render screen
  let screenEl;
  if (screen === 'home') {
    screenEl = (
      <HomeScreen
        wardrobe={wardrobe} history={history}
        onCompare={goCompare}
        onSetup={goSetup}
        onItem={(w) => { onEditItem(w); }}
        onHistory={() => {}}
      />
    );
  } else if (screen === 'compare') {
    screenEl = (
      <CompareInputScreen
        wardrobe={wardrobe}
        draft={draft} setDraft={setDraft}
        onBack={goHome}
        onCompute={goResult}
      />
    );
  } else if (screen === 'result') {
    screenEl = baseGarment ? (
      <ResultScreen
        base={baseGarment} candidate={draft}
        judgementUI={t.judgementUI} showLabels={t.showLabels}
        onBack={goCompare}
        onSave={onSaveResult}
        onChangeBase={goCompare}
      />
    ) : null;
  } else if (screen === 'setup') {
    screenEl = (
      <SetupListScreen
        wardrobe={wardrobe}
        onBack={goHome}
        onAdd={onAddItem}
        onEdit={onEditItem}
        onTogglePrimary={onTogglePrimary}
      />
    );
  } else if (screen === 'edit') {
    screenEl = (
      <SetupEditScreen
        initial={editTarget}
        onBack={() => setScreen('setup')}
        onSave={onSaveItem}
      />
    );
  }

  return (
    <>
      <style>{`
        @keyframes fitto-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <IOSDevice dark={t.darkPhone}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          background: t.darkPhone ? '#1a1a1a' : '#faf8f4',
          paddingTop: 54, paddingBottom: 24,
          boxSizing: 'border-box',
        }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <SlideStack screen={screen}>{screenEl}</SlideStack>
          </div>
        </div>
      </IOSDevice>

      <TweaksPanel>
        <TweakSection label="判定UIのバリエーション" />
        <TweakRadio label="表示" value={t.judgementUI}
          options={[
            { value: 'all', label: '全部入り' },
            { value: 'label', label: 'ラベル' },
            { value: 'score', label: 'スコア' },
            { value: 'breakdown', label: '項目別' },
          ]}
          onChange={(v) => setTweak('judgementUI', v)} />

        <TweakSection label="図のラベル" />
        <TweakToggle label="吹き出しを表示" value={t.showLabels}
          onChange={(v) => setTweak('showLabels', v)} />

        <TweakSection label="ジャンプ" />
        <TweakButton label="ホーム" onClick={() => setScreen('home')} />
        <TweakButton label="比較入力" onClick={() => setScreen('compare')} />
        <TweakButton label="結果画面" onClick={() => setScreen('result')} />
        <TweakButton label="ジャスト服一覧" onClick={() => setScreen('setup')} />
        <TweakButton label="新規登録" onClick={() => { setEditTarget(null); setScreen('edit'); }} />
      </TweaksPanel>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Mount
// ─────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
