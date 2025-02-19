import { authMiddleware } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // "/"とAPIルートを公開ルートとして設定
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook(.*)",
    "/api/user(.*)", // ユーザー情報APIを公開ルートとして追加
    "/_next/static/(.*)",
    "/favicon.ico",
  ],
  ignoredRoutes: [
    "/api/webhook(.*)",
  ],
});

// Middleware設定を更新
export const config = {
  matcher: [
    // 除外するパス
    "/((?!.+\\.[\\w]+$|_next).*)",
    // APIルートを含める
    "/(api|trpc)(.*)"
  ],
}; 