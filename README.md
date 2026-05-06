# fashion-size-feeling

服のサイズ比較アプリ「fitto」— Google Apps Script 実装。

## ファイル構成

- `Code.gs` — GAS サーバーサイド（`doGet` + `callGemini`）
- `index.html` — React フロントエンド（JSX インライン、全画面含む）
- `project/` — Claude Design ハンドオフ元プロトタイプ

## セットアップ

1. GAS エディタに `Code.gs` と `index.html` を貼り付け
2. スクリプトのプロパティ → `GEMINI_API_KEY` を追加
3. デプロイ → ウェブアプリ
