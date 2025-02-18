import React from 'react';
import UserProfileClient from './UserProfileClient';

export default function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <UserProfileClient id={params.id} />
    </React.Suspense>
  );
} 