import { auth } from '@clerk/nextjs/server';
import { UserProvider } from './UserContext';
import UserProfileClient from './UserProfileClient';
import ErrorBoundary from './ErrorBoundary';
import { cn } from '@/lib/utils';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-cyber-darker"
      )}>
        <div className={cn(
          "p-8 rounded-lg",
          "bg-cyber-black",
          "border border-cyber-green",
          "shadow-neon-card",
          "text-center"
        )}>
          <h1 className={cn(
            "text-2xl font-cyber text-cyber-green mb-4",
            "animate-neon-pulse"
          )}>
            アクセスが拒否されました
          </h1>
          <p className="text-cyber-green/80 font-cyber">
            このページを表示するにはログインが必要です
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen py-12 px-4",
      "bg-cyber-darker"
    )}>
      <ErrorBoundary>
        <UserProvider userId={params.id}>
          <UserProfileClient id={params.id} />
        </UserProvider>
      </ErrorBoundary>
    </div>
  );
} 