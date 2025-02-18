import React, { useState, useEffect } from 'react';

interface User {
  clerkUserId: string;
  username: string;
  email: string;
  avatarUrl: string;
}

const ProfilePage: React.FC<{ userId: string }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/getUser?clerkUserId=${userId}`);
      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/updateUser', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: user.clerkUserId,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>プロフィール</h1>
      <input value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} />
      <input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
      <input value={user.avatarUrl} onChange={(e) => setUser({ ...user, avatarUrl: e.target.value })} />
      <button onClick={handleUpdate}>更新</button>
    </div>
  );
};

export default ProfilePage; 