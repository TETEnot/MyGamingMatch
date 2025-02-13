"use client";

import { SignInButton, SignOutButton, SignUpButton, useUser } from '@clerk/nextjs';

export default function AuthButtons() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <>
          <SignOutButton>
            <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">ログアウト</button>
          </SignOutButton>
        </>
      ) : (
        <>
          <SignInButton>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">ログイン</button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-green-500 text-white px-4 py-2 rounded">アカウント作成</button>
          </SignUpButton>
        </>
      )}
    </div>
  );
}