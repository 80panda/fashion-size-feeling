// data.jsx — domain model, sample data, comparison logic

// ─────────────────────────────────────────────────────────────
// CATEGORIES & MEASUREMENT FIELDS
// ─────────────────────────────────────────────────────────────
const CATEGORIES = {
  pants: {
    id: 'pants',
    label: 'ボトムス',
    labelEn: 'Pants',
    fields: [
      { key: 'waist',     ja: 'ウエスト',     short: 'W',   axis: 'circ' },
      { key: 'hip',       ja: 'ヒップ',       short: 'H',   axis: 'circ' },
      { key: 'thigh',     ja: 'わたり幅',     short: 'TH',  axis: 'flat' },
      { key: 'rise',      ja: '股上',         short: 'R',   axis: 'flat' },
      { key: 'hem',       ja: '裾幅',         short: 'HM',  axis: 'flat' },
      { key: 'inseam',    ja: '股下',         short: 'IN',  axis: 'flat' },
    ],
  },
  tops: {
    id: 'tops',
    label: 'トップス',
    labelEn: 'Tops',
    fields: [
      { key: 'shoulder',  ja: '肩幅',         short: 'S',   axis: 'flat' },
      { key: 'chest',     ja: '身幅',         short: 'C',   axis: 'flat' },
      { key: 'length',    ja: '着丈',         short: 'L',   axis: 'flat' },
      { key: 'sleeve',    ja: '袖丈',         short: 'SL',  axis: 'flat' },
      { key: 'cuff',      ja: '袖口',         short: 'CF',  axis: 'flat' },
      { key: 'neck',      ja: '首回り',       short: 'N',   axis: 'circ' },
    ],
  },
  outer: {
    id: 'outer',
    label: 'アウター',
    labelEn: 'Outer',
    fields: [
      { key: 'shoulder',  ja: '肩幅',         short: 'S',   axis: 'flat' },
      { key: 'chest',     ja: '身幅',         short: 'C',   axis: 'flat' },
      { key: 'length',    ja: '着丈',         short: 'L',   axis: 'flat' },
      { key: 'sleeve',    ja: '袖丈',         short: 'SL',  axis: 'flat' },
      { key: 'hem',       ja: '裾幅',         short: 'HM',  axis: 'flat' },
    ],
  },
};

// Default just-size wardrobe, seeded with the user's example pants
const DEFAULT_WARDROBE = [
  {
    id: 'w1',
    category: 'pants',
    name: 'ジャストパンツ',
    brand: 'A.P.C. — Petit Standard',
    sizeLabel: '31',
    primary: true,
    measures: { waist: 84.5, hip: 100.5, thigh: 31, rise: 25, hem: 18.5, inseam: 78.5 },
    note: '基準にしている一本',
  },
  {
    id: 'w2',
    category: 'pants',
    name: 'ややゆるめパンツ',
    brand: 'AURALEE — Light Wool',
    sizeLabel: '4',
    primary: false,
    measures: { waist: 88, hip: 104, thigh: 33, rise: 27, hem: 19.5, inseam: 80 },
    note: '休日用にゆとりあり',
  },
  {
    id: 'w3',
    category: 'tops',
    name: 'ジャストTシャツ',
    brand: 'COMOLI — Cotton Tee',
    sizeLabel: '2',
    primary: true,
    measures: { shoulder: 44, chest: 51, length: 67, sleeve: 21, cuff: 17, neck: 41 },
    note: '夏の基準',
  },
  {
    id: 'w4',
    category: 'tops',
    name: 'お気に入りニット',
    brand: 'YAECA — Crew Knit',
    sizeLabel: 'M',
    primary: false,
    measures: { shoulder: 46, chest: 56, length: 65, sleeve: 60, cuff: 9.5, neck: 18 },
    note: 'ゆとり多め',
  },
  {
    id: 'w5',
    category: 'outer',
    name: 'ジャストコート',
    brand: 'MARGARET HOWELL — Wool Coat',
    sizeLabel: 'S',
    primary: true,
    measures: { shoulder: 47, chest: 56, length: 102, sleeve: 62, hem: 60 },
    note: 'インナー薄手前提',
  },
];

// Sample comparison candidates (the "shop" you're considering)
const SAMPLE_CANDIDATE_PANTS = {
  brand: 'Lemaire',
  product: 'Twisted Belted Pants',
  sizeLabel: '46',
  category: 'pants',
  measures: { waist: 87, hip: 106, rise: 30, hem: 22, inseam: 82 },
  // thigh deliberately missing → triggers estimation flow
};

// ─────────────────────────────────────────────────────────────
// COMPARISON LOGIC
// ─────────────────────────────────────────────────────────────
// Per-field tolerance bands (cm) — beyond these we tag warning/major.
const TOLERANCE = {
  // circumference fields are looser (body wraps around)
  waist:    { fit: 2,   loose: 5,  major: 9 },
  hip:      { fit: 2,   loose: 5,  major: 9 },
  chest:    { fit: 2,   loose: 5,  major: 9 },
  neck:     { fit: 1,   loose: 2,  major: 4 },
  // flat shoulder / hem / cuff — tight
  shoulder: { fit: 1.5, loose: 3,  major: 5 },
  thigh:    { fit: 1.5, loose: 3,  major: 5 },
  rise:     { fit: 1.5, loose: 3,  major: 5 },
  hem:      { fit: 2,   loose: 4,  major: 6 },
  cuff:     { fit: 1,   loose: 2,  major: 4 },
  // length-ish
  length:   { fit: 2,   loose: 5,  major: 9 },
  sleeve:   { fit: 2,   loose: 4,  major: 7 },
  inseam:   { fit: 2,   loose: 4,  major: 7 },
};

// Estimate a missing measurement based on related ones (rough heuristics)
function estimateField(category, key, measures) {
  const m = measures || {};
  if (category === 'pants') {
    if (key === 'thigh' && m.hip) return +(m.hip * 0.305).toFixed(1);
    if (key === 'hem' && m.thigh) return +(m.thigh * 0.6).toFixed(1);
    if (key === 'rise' && m.waist) return +(m.waist * 0.30).toFixed(1);
    if (key === 'inseam') return 80;
    if (key === 'waist' && m.hip) return +(m.hip * 0.85).toFixed(1);
    if (key === 'hip' && m.waist) return +(m.waist * 1.18).toFixed(1);
  }
  if (category === 'tops' || category === 'outer') {
    if (key === 'shoulder' && m.chest) return +(m.chest * 0.83).toFixed(1);
    if (key === 'chest' && m.shoulder) return +(m.shoulder * 1.21).toFixed(1);
    if (key === 'sleeve') return category === 'outer' ? 62 : 60;
    if (key === 'length') return 68;
    if (key === 'cuff' && m.sleeve) return 9.5;
    if (key === 'neck' && m.chest) return +(m.chest * 0.34).toFixed(1);
  }
  return null;
}

// One row of the comparison: { field, ja, base, target, diff, status, estimated }
function compareItem(baseGarment, candidate) {
  const cat = CATEGORIES[baseGarment.category];
  if (!cat) return [];
  return cat.fields.map(f => {
    const base = baseGarment.measures?.[f.key];
    let target = candidate.measures?.[f.key];
    let estimated = false;
    if (target === undefined || target === null || target === '') {
      const est = estimateField(candidate.category, f.key, candidate.measures);
      if (est !== null) { target = est; estimated = true; }
    }
    if (base == null || target == null) {
      return { ...f, base, target, diff: null, status: 'missing', estimated };
    }
    const diff = +(target - base).toFixed(1);
    const tol = TOLERANCE[f.key] || { fit: 2, loose: 4, major: 7 };
    const abs = Math.abs(diff);
    let status;
    if (abs <= tol.fit)        status = 'fit';
    else if (abs <= tol.loose) status = (diff > 0 ? 'slightly-loose' : 'slightly-tight');
    else if (abs <= tol.major) status = (diff > 0 ? 'loose' : 'tight');
    else                       status = (diff > 0 ? 'too-loose' : 'too-tight');
    return { ...f, base, target, diff, status, estimated };
  });
}

// Aggregate verdict + score (0–100)
function verdict(rows) {
  const valid = rows.filter(r => r.diff != null);
  if (!valid.length) return { label: '判定不可', score: null, summary: 'サイズ情報が足りません', tone: 'neutral' };
  let score = 100;
  let majorCount = 0, looseCount = 0, tightCount = 0;
  valid.forEach(r => {
    const tol = TOLERANCE[r.key] || { fit: 2, loose: 4, major: 7 };
    const abs = Math.abs(r.diff);
    if (abs <= tol.fit) score -= 0;
    else if (abs <= tol.loose) score -= 4;
    else if (abs <= tol.major) score -= 10;
    else { score -= 18; majorCount++; }
    if (r.diff > tol.fit) looseCount++;
    if (r.diff < -tol.fit) tightCount++;
  });
  score = Math.max(0, Math.round(score));
  let label, tone, summary;
  if (score >= 88) { label = 'ぴったり'; tone = 'ok'; summary = 'ジャストとほぼ同寸。安心して買えます。'; }
  else if (score >= 70 && looseCount > tightCount) { label = '少しゆるめ'; tone = 'soft'; summary = 'リラックスフィット寄り。ゆとりが好みなら◎'; }
  else if (score >= 70 && tightCount > looseCount) { label = '少しタイト'; tone = 'soft'; summary = '細身寄り。試着できると安心。'; }
  else if (score >= 50 && looseCount > tightCount) { label = 'ゆるい'; tone = 'warn'; summary = 'オーバーサイズ寄り。シルエットが大きく変わります。'; }
  else if (score >= 50 && tightCount > looseCount) { label = 'タイト'; tone = 'warn'; summary = '締め付け感が出やすいサイズ感です。'; }
  else { label = 'サイズ差大'; tone = 'bad'; summary = 'ジャストとは別物のシルエットになります。'; }
  return { label, score, summary, tone, majorCount, looseCount, tightCount, valid: valid.length };
}

// helper for figure callouts: {key → "+27cm ゆったり" etc}
function calloutText(diff, axis) {
  if (diff == null) return null;
  const sign = diff > 0 ? '+' : '−';
  const abs = Math.abs(diff).toFixed(diff % 1 === 0 ? 0 : 1);
  let qual = '';
  if (axis === 'circ' || axis === 'flat') {
    if (Math.abs(diff) < 1.2) qual = 'ジャスト';
    else if (diff > 0 && Math.abs(diff) < 4) qual = 'ややゆとり';
    else if (diff > 0) qual = 'ゆったり';
    else if (Math.abs(diff) < 4) qual = 'ややタイト';
    else qual = 'タイト';
  }
  return { headline: `${sign}${abs}cm`, qual };
}

window.fittoData = {
  CATEGORIES,
  DEFAULT_WARDROBE,
  SAMPLE_CANDIDATE_PANTS,
  TOLERANCE,
  estimateField,
  compareItem,
  verdict,
  calloutText,
};
