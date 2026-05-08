// fitto — サイズ比較アプリ
// Google Apps Script サーバーサイド

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('fitto — 服のサイズ比較')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Gemini API を呼び出す。
 * スクリプトプロパティ GEMINI_API_KEY が必要。
 * クライアントからは google.script.run.callGemini(prompt) で呼び出す。
 */
function callGemini(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY がスクリプトプロパティに設定されていません。\n[設定方法] スクリプトエディタ → プロジェクトの設定 → スクリプトプロパティ → GEMINI_API_KEY を追加');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  });

  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code !== 200) {
    throw new Error('Gemini API エラー (HTTP ' + code + '): ' + text.slice(0, 300));
  }

  const data = JSON.parse(text);
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) {
    throw new Error('Gemini から空のレスポンスが返りました');
  }
  return result;
}

function callGeminiWithImage(base64Data, mimeType) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY がスクリプトプロパティに設定されていません。');
  }

  const prompt = `あなたはアパレルECサイトのサイズ表を構造化するアシスタントです。
この画像からサイズ表（寸法）を読み取り、JSONで返してください。

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
      "isRange": false
    }
  ],
  "confidence": "high" | "medium" | "low",
  "notes": "曖昧だった点や仮定があれば短く"
}

【マッピングのルール】
- 「ウエスト」「胴回り」→ waist, 「ヒップ」「腰回り」→ hip
- 「もも幅」「わたり幅」「ワタリ」→ thigh（周径表記は÷2）
- 「股上」「ライズ」→ rise, 「股下」「インシーム」→ inseam
- 「裾幅」→ hem（周径表記は÷2）
- 「肩幅」→ shoulder, 「身幅」→ chest, 「着丈」→ length
- 「袖丈」→ sleeve, 「袖口」→ cuff, 「首回り」→ neck
- inchはcmに換算（×2.54）
- 複数サイズがあれば全部 sizes に入れる

JSONのみ返してください。`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        { inlineData: { mimeType: mimeType, data: base64Data } }
      ]}],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  });

  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code !== 200) {
    throw new Error('Gemini API エラー (HTTP ' + code + '): ' + text.slice(0, 300));
  }

  const data = JSON.parse(text);
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) {
    throw new Error('Gemini から空のレスポンスが返りました');
  }
  return result;
}
