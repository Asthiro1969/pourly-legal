# pourly-legal

Pourly の公開ページ（GitHub Pages＋独自ドメイン **https://pourly.asthiro.com**）。

| URL | 中身 |
|---|---|
| /terms.html | 利用規約 |
| /privacy.html | プライバシーポリシー |
| /delete-account.html | アカウント削除の申請 |
| /support.html | サポート（support@asthiro.com・よくある質問） |
| /r/<レシピID> | 共有 URL の受け口（404.html が処理。`APP_STORE_URL` を入れると App Store へ転送） |

文面の元は Pourly リポジトリの `docs/10_terms_privacy.md` と `docs/legal-delete-request.md`。
HTML は手元の `_build/build.py` で生成する（`_build` は GitHub に上げない）。

運営者：Asthiro（本木 広郎）
