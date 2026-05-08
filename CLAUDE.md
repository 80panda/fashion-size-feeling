# fitto — CLAUDE.md

## 本番URL（ユーザー向け）

**https://80panda.github.io/fashion-size-feeling/app.html**
（GitHub Pages 経由の iframe 配信 → GAS バナーなし）

## GAS デプロイ情報

| バージョン | デプロイID | URL |
|---|---|---|
| v1.7.2 | `AKfycbyo4NFqE8XTn8Bl7HfBC-rMn33F2TPLvvTiTSBbhOS4YPTGtjNyckhlb1-Y4sIDvbv-MA` | https://script.google.com/macros/s/AKfycbyo4NFqE8XTn8Bl7HfBC-rMn33F2TPLvvTiTSBbhOS4YPTGtjNyckhlb1-Y4sIDvbv-MA/exec |

本番URLを変えずに更新するコマンド:
```bash
clasp push
clasp deploy --deploymentId AKfycbyo4NFqE8XTn8Bl7HfBC-rMn33F2TPLvvTiTSBbhOS4YPTGtjNyckhlb1-Y4sIDvbv-MA --description "vX.Y.Z"
```

## スクリプトプロパティ

| キー | 用途 |
|---|---|
| `GEMINI_API_KEY` | Gemini 2.5 Flash APIキー |

## 開発フロー（gas-clasp-workflowスキル準拠）

1. コードを編集
2. `clasp push` → GASで動作確認
3. `git commit & push`
4. `clasp deploy --deploymentId ... --description "vX.Y.Z"`
