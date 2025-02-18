import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

// Enable pusher logging - don't include this in production
PusherClient.logToConsole = true;

// 環境変数のチェックと詳細なログ出力
const requiredEnvVars = {
  PUSHER_APP_ID: process.env.PUSHER_APP_ID,
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  PUSHER_SECRET: process.env.PUSHER_SECRET,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
};

console.log('Pusher: Environment variables check:', {
  appId: process.env.PUSHER_APP_ID || 'Not set',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'Not set',
  secret: process.env.PUSHER_SECRET || 'Not set',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'Not set'
});

// クライアントサイドでは一部の環境変数のみチェック
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) throw new Error('NEXT_PUBLIC_PUSHER_KEY is required');
  if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) throw new Error('NEXT_PUBLIC_PUSHER_CLUSTER is required');
} else {
  // サーバーサイドでは全ての環境変数をチェック
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
  }
);

// デバッグログの強化
pusherClient.connection.bind('initialized', () => {
  console.log('Pusher: Initialized with config:', {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  });
});

pusherClient.connection.bind('connecting', () => {
  console.log('Pusher: Connecting to server...');
});

pusherClient.connection.bind('connected', () => {
  console.log('Pusher: Connected successfully with socket ID:', pusherClient.connection.socket_id);
});

pusherClient.connection.bind('disconnected', () => {
  console.log('Pusher: Disconnected from server');
});

pusherClient.connection.bind('error', (error: any) => {
  console.error('Pusher: Connection error:', error);
});

// チャンネル購読のデバッグ
pusherClient.connection.bind('state_change', (states: { current: string; previous: string }) => {
  console.log('Pusher: Connection state changed from', states.previous, 'to', states.current);
});

if (process.env.NODE_ENV === 'development') {
  console.log('Pusher: Development mode configuration:', {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    appId: process.env.PUSHER_APP_ID ? 'Set' : 'Not set',
    secret: process.env.PUSHER_SECRET ? 'Set' : 'Not set'
  });
} 