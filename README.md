# Game Matching App

サイバーパンクテーマのゲームプレイヤーマッチングアプリケーション

## 概要

このアプリケーションは、ゲームプレイヤー同士のマッチングを支援するWebプラットフォームです。サイバーパンクをテーマにした未来的なUIデザインを採用し、直感的な操作性と視覚的な魅力を両立しています。

### 主な機能

- 🎮 ゲームプレイヤーとのマッチング
- 👥 ユーザープロフィール管理
- 💬 リアルタイム通知システム
- ❤️ いいね・フォロー機能
- 🔍 ゲームプレイヤー検索
- 🎲 スワイプ式のマッチング機能

## 技術スタック

### フロントエンド
- Next.js 14.1.0 (React 18.3.1)
- TypeScript
- Tailwind CSS
- Clerk (認証)
- Framer Motion (アニメーション)
- React Hot Toast (通知)
- Lucide React (アイコン)

### バックエンド
- Prisma (ORM)
- SQLite (開発環境)
- Pusher (リアルタイム通信)

### 開発ツール
- ESLint
- PostCSS
- Autoprefixer

## セットアップ手順

### 前提条件
- Node.js 18.0.0以上
- npm 9.0.0以上
- Git

### 1. リポジトリのクローン
```bash
git clone https://github.com/[your-username]/[repository-name].git
cd [repository-name]
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# Clerk認証
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# データベース
DATABASE_URL="file:./dev.db"

# Pusher設定（リアルタイム通知用）
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

### 4. データベースのセットアップ
```bash
npx prisma generate
npx prisma db push
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で利用可能になります。

## プロジェクト構造

```
src/
├── app/                    # Next.js 13 App Router
│   ├── api/               # APIエンドポイント
│   ├── user/              # ユーザー関連ページ
│   └── search/            # 検索機能
├── components/            # 再利用可能なコンポーネント
├── lib/                   # ユーティリティ関数
├── styles/               # グローバルスタイル
└── types/                # TypeScript型定義
```

## 主要コンポーネント

### PostCard
投稿カードコンポーネント。ユーザーの投稿を表示し、いいねやフォロー機能を提供します。

### SwipeCardList
Tinderライクなスワイプインターフェースを実装したコンポーネント。ユーザー同士のマッチングに使用されます。

### ProfileClient
ユーザープロフィールの表示と編集機能を提供するコンポーネント。

## スタイリング

サイバーパンクテーマを実現するために、以下のデザイン要素を使用：

- ネオンエフェクト
- グロー効果
- サイバーグリッド背景
- アニメーション効果

```css
/* スタイリング例 */
.cyber-button {
  @apply bg-transparent border border-[#00ff00] text-[#00ff00]
         px-4 py-2 rounded transition-all duration-300
         hover:bg-[#00ff00] hover:text-black
         hover:shadow-[0_0_10px_#00ff00];
}
```

## 認証システム

Clerkを使用して以下の認証機能を実装：

- メール/パスワード認証
- ソーシャルログイン
- セッション管理
- ユーザープロフィール管理

## データベーススキーマ

主要なテーブル構造：

- User (ユーザー情報)
- Post (投稿)
- Like (いいね)
- Follow (フォロー関係)
- Notification (通知)

## デプロイ

### Vercelへのデプロイ
1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定
4. デプロイを実行

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## トラブルシューティング

### よくある問題と解決方法

1. **認証エラー**
   - Clerk環境変数の確認
   - ブラウザのキャッシュクリア

2. **データベースエラー**
   - Prismaスキーマの再生成
   - データベースのマイグレーション実行

3. **ビルドエラー**
   - 依存関係の再インストール
   - Next.jsキャッシュのクリア

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## お問い合わせ

バグ報告や機能リクエストは、GitHubのIssueを通じてお願いします。

---

このプロジェクトは継続的に改善を行っています。フィードバックや貢献を歓迎します。
