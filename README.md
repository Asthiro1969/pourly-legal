# pourly-legal

規約・プライバシーポリシー・アカウント削除案内の公開ページ（GitHub Pages 用）。

## 公開手順（5 分）

1. GitHub で `pourly-legal` という **public** リポジトリを作る
2. このフォルダの中身をそのまま push する
3. リポジトリの Settings → Pages → Source を「Deploy from a branch」、Branch を `main` / `(root)` にして Save
4. 数分後に `https://<ユーザー名>.github.io/pourly-legal/` で開ける
5. `terms.html` `privacy.html` の URL を Google Cloud の OAuth 同意画面と `.env` の `EXPO_PUBLIC_TERMS_URL` / `EXPO_PUBLIC_PRIVACY_URL` に入れる

## 公開前に埋めるもの

- 【運営者氏名】【連絡先メールアドレス】【制定日】（3 ファイル共通。エディタの全置換で）
- 埋めたら各ページ冒頭の「この文書は草案です」の段落（`class="note"`）を消す
