import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import LikesClient from './LikesClient'

export default async function LikesPage() {
  const { userId } = auth()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) return null

  const likedPosts = await prisma.like.findMany({
    where: {
      userId: user.id
    },
    include: {
      post: {
        include: {
          user: true,
          likes: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })

  return <LikesClient likedPosts={likedPosts} currentUserId={user.id} />
} 