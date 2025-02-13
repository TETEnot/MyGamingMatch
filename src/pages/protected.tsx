import { useUser } from '@clerk/nextjs';

export default function ProtectedPage() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return null;
  }

  return <div>このページは認証済みユーザーのみがアクセスできます。</div>;
} 