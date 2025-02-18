export async function verifyClerkToken(token: string): Promise<any> {
  // トークンの検証ロジックをここに実装します
  // 仮の実装として、適切なclerkUserオブジェクトを返す
  const clerkUser = {
    id: 'user_123',
    email_addresses: [{ email_address: 'example@example.com' }],
    first_name: 'John',
    last_name: 'Doe',
    profile_image_url: 'http://example.com/profile.jpg',
  };
  console.log('Clerk User:', clerkUser); // デバッグ用ログ
  return clerkUser;
} 