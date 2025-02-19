import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Protected({ children }: { children: React.ReactNode }) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className={cn(
      "min-h-screen",
      "bg-cyber-darker",
      "text-cyber-green"
    )}>
      {children}
    </div>
  );
} 