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
