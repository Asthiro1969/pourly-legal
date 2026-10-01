# pourly-legal

Pourly の公開ページ（GitHub Pages＋独自ドメイン **https://pourly.asthiro.com**）。

| URL | 中身 |
|---|---|
| /terms.html | 利用規約 |
| /privacy.html | プライバシーポリシー |
| /delete-account.html | アカウント削除の申請 |
| /support.html | サポート（support@asthiro.com・よくある質問） |
| /r/<レシピID> | 共有 URL のレシピページ（閲覧のみ。`/r/index.html`＋`/r/recipe.js` が anon キーで Supabase を読む。Cloudflare の Transform Rule で `/r/*` → `/r/index.html` に書き換えて 200 で返す。書き換えが効かないときは 404.html が同じ JS を読む保険）。`APP_STORE_URL`（`_build/recipe.js`）を入れると「App Store で入手」ボタンが出る |
| /og.png | 共有 URL のプレビュー画像（全レシピ共通、1200×630。build.py がロゴから作る） |

文面の元は Pourly リポジトリの `docs/10_terms_privacy.md` と `docs/legal-delete-request.md`。
HTML は手元の `_build/build.py` で生成する（`_build` は GitHub に上げない）：`python3 _build/build.py . 2026年9月26日 2026年10月1日`（第 2 引数は制定日、第 3 引数は最終改定日。省略すると改定日は出ない）。

運営者：Asthiro（本木 広郎）
