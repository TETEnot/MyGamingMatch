import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/ProfileClient';
import Header from '@/components/Header';

export default async function ProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ProfileClient userId={userId} />
      </div>
    </div>
  );
} 