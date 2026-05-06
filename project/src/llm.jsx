// llm.jsx — thin adapter for size-table parsing
// Currently uses window.claude.complete (sandbox) for prototyping.
// When migrating to production with Claude Code, replace `callLLM` body
// with the Gemini implementation below. The exported API is stable.

// ─────────────────────────────────────────────────────────────
// Provider abstraction
// ─────────────────────────────────────────────────────────────
async function callLLM(prompt) {
  // === Prototype path (this sandbox) ===
  if (window.claude && window.claude.complete) {
    return await window.claude.complete(prompt);
  }

  // === Production path (Claude Code → Gemini free tier) ===
  // const apiKey = localStorage.getItem('GEMINI_API_KEY');
  // const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  // const res = await fetch(url, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     contents: [{ parts: [{ text: prompt }] }],
  //     generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  //   }),
  // });
  // const data = await res.json();
  // return data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  throw new Error('No LLM provider available');
}

// ─────────────────────────────────────────────────────────────
// parseSizeTable(rawText, hintCategory?) → {
//   category: 'pants' | 'tops' | 'outer',
//   sizes: [
//     { sizeLabel: string, measures: { [fieldKey]: number }, isRange?: boolean, raw?: {} }
//   ],
//   confidence: 'high' | 'medium' | 'low',
//   notes?: string,
// }
// ─────────────────────────────────────────────────────────────
async function parseSizeTable(rawText, hintCategory = null) {
  const fieldMap = {
    pants:  ['waist', 'hip', 'thigh', 'rise', 'hem', 'inseam'],
    tops:   ['shoulder', 'chest', 'length', 'sleeve', 'cuff', 'neck'],
    outer:  ['shoulder', 'chest', 'length', 'sleeve', 'hem'],
  };

  const prompt = `あなたはアパレルECサイトのサイズ表を構造化するアシスタントです。
以下のテキストから、商品の寸法を読み取り、JSONで返してください。

【出力スキーマ】
{
  "category": "pants" | "tops" | "outer",
  "sizes": [
    {
      "sizeLabel": "S, M, 46, F など",
      "measures": {
        // pants:  waist, hip, thigh, rise, hem, inseam
        // tops:   shoulder, chest, length, sleeve, cuff, neck
        // outer:  shoulder, chest, length, sleeve, hem
        // 値は cm の数値のみ（単位記号なし）
      },
      "isRange": false  // ウエストが「65〜96」のような可変範囲なら true（値は中央値を入れる）
    }
  ],
  "confidence": "high" | "medium" | "low",
  "notes": "曖昧だった点や仮定があれば短く（特に周径↔平置きの換算をした場合は明記）"
}

【マッピングのルール】
- pants:
  - 「ウエスト」「胴回り」「ウェスト」→ waist（平置き直線想定）
  - 「ヒップ」「ヒップ周り」「腰回り」→ hip
  - 「もも幅」「わたり幅」「腿幅」「ワタリ」→ thigh（基本同義として扱う）
  - 「もも周り」など"周り/周"が付く周径表記 → ÷2 して thigh に入れる（notesに明記）
  - 「股上」「ライズ」→ rise
  - 「股下」「インシーム」→ inseam
  - 「裾幅」「裾」「すそ幅」→ hem（平置き）
  - 「裾周り」「すそ周り」など周径表記 → ÷2 して hem に入れる（notesに明記）
  - 「ヒザ幅」「膝幅」→ 一般項目ではないので無視（読み取らない）
- tops/outer:
  - 「肩幅」→ shoulder, 「身幅」「胸囲」→ chest, 「着丈」「総丈」「丈」→ length, 「袖丈」「袖」→ sleeve
  - 「袖口」「カフス」→ cuff, 「首回り」→ neck
- 単位がinch表記の場合は cm に換算（1 inch = 2.54 cm）。
- カテゴリは語彙から推論。
- サイズ表記が複数ある場合は全部 sizes 配列に入れる。
- 範囲表記（「65〜96」「78-82」）は中央値を採用し isRange: true。
- 商品説明文や注釈は無視。
${hintCategory ? `- ヒント: ユーザーは現在「${hintCategory}」カテゴリを選んでいます。テキストと矛盾しなければそのまま使ってください。` : ''}

【入力テキスト】
${rawText}

JSONのみを返してください。前後の説明文は不要です。`;

  let text = await callLLM(prompt);
  text = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch (e2) { throw new Error('JSON parse failed: ' + text.slice(0, 200)); }
    } else {
      throw new Error('No JSON found in response');
    }
  }

  const cat = ['pants', 'tops', 'outer'].includes(parsed.category) ? parsed.category : (hintCategory || 'pants');
  const allowed = fieldMap[cat] || [];

  // Backward compat: old schema had a single `measures` + `sizeLabel`
  let rawSizes = Array.isArray(parsed.sizes) ? parsed.sizes : null;
  if (!rawSizes && parsed.measures) {
    rawSizes = [{ sizeLabel: parsed.sizeLabel, measures: parsed.measures, isRange: false }];
  }
  rawSizes = rawSizes || [];

  const sizes = rawSizes.map(s => {
    const measures = {};
    Object.entries(s.measures || {}).forEach(([k, v]) => {
      if (allowed.includes(k)) {
        const num = typeof v === 'number' ? v : parseFloat(v);
        if (!isNaN(num)) measures[k] = +num.toFixed(1);
      }
    });
    return {
      sizeLabel: s.sizeLabel ? String(s.sizeLabel) : '',
      measures,
      isRange: !!s.isRange,
    };
  }).filter(s => Object.keys(s.measures).length > 0);

  return {
    category: cat,
    sizes,
    confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    notes: parsed.notes ? String(parsed.notes) : undefined,
  };
}

window.fittoLLM = { parseSizeTable };
