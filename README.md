# メディアビューア

ブラウザ上で PDF・EPUB・動画を閲覧できる静的 Web アプリです。  
ファイルはサーバーにアップロードされず、すべてブラウザ内で処理されます。

## 対応形式

| 形式 | 拡張子 |
|------|--------|
| PDF | `.pdf` |
| EPUB | `.epub` |
| 動画 | `.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v` |

## 機能

- ファイル選択ボタン / ドラッグ&ドロップでローカルファイルを開く
- URL パラメータ `?file=` でファイルを指定して開く
- PDF: ページ送り・ズーム
- EPUB: ページ送り・目次サイドバー
- 動画: HTML5 ネイティブプレイヤー

## ローカル開発（devcontainer）

### 前提

- [Docker](https://www.docker.com/) がインストールされていること
- VS Code または Cursor に Dev Containers 拡張機能が入っていること

### 手順

1. リポジトリをクローン
2. VS Code / Cursor でフォルダを開く
3. コマンドパレット → **Dev Containers: Reopen in Container**
4. コンテナ起動後:

```bash
npm run dev
```

5. ブラウザで http://localhost:5173 を開く

### devcontainer なしで開発する場合

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 本番ビルド（dist/）
npm run preview  # ビルド結果の確認
```

## URL パラメータ

```
?file=<パスまたはURL>
```

例:

```
# リポジトリ内のサンプルファイル（GitHub Pages）
https://<user>.github.io/viewer/?file=/samples/demo.pdf

# ローカル開発
http://localhost:5173/viewer/?file=/samples/demo.epub

# 外部 URL（CORS 許可が必要）
http://localhost:5173/?file=https://example.com/book.pdf
```

`public/` 配下にファイルを置くと、ビルド後に `/viewer/samples/...` として配信されます。

## GitHub Pages デプロイ

1. GitHub にリポジトリ `viewer` を作成して push
2. リポジトリ Settings → **Pages** → Source: **GitHub Actions** を選択
3. `main` ブランチへ push すると `.github/workflows/deploy.yml` が自動デプロイ

公開 URL: `https://<user>.github.io/viewer/`

> リポジトリ名が `viewer` 以外の場合は `vite.config.ts` の `base` を変更してください。

## 制限事項

- GitHub Pages は静的ホスティングのみ（サーバー側変換なし）
- DRM 付き EPUB / 暗号化 PDF は非対応
- 外部 URL の読み込みは相手サーバーの CORS 設定に依存
- 大容量ファイル（数百 MB 以上の動画等）はブラウザのメモリ制限に注意

## 技術スタック

- [Vite](https://vitejs.dev/) + TypeScript
- [pdf.js](https://mozilla.github.io/pdf.js/) — PDF 表示
- [epub.js](https://github.com/futurepress/epub.js) — EPUB 表示
- HTML5 `<video>` — 動画再生
# viewer
