import DataLoader from 'dataloader';
import { PrismaClient, User, Profile, Post, MemberType } from '@prisma/client';

export const prismaLoaders = (prisma: PrismaClient) => {
    if (!prisma) throw new Error("Prisma client is not initialized");

    return {
        userLoader: new DataLoader<string, User | null>(async (userIds) => {
            const users = await prisma.user.findMany({
                where: { id: { in: Array.from(userIds) } },
                include: { subscribedToUser: true, userSubscribedTo: true },
            });
            return userIds.map((id) => users.find((user) => user.id === id) ?? null);
        }),

        profileLoader: new DataLoader<string, Profile | null>(async (ids) => {
            const profiles = await prisma.profile.findMany({
                where: { userId: { in: Array.from(ids) } },
            });
            return ids.map((id) => profiles.find((profile) => profile.userId === id) ?? null);
        }),

        profileIdLoader: new DataLoader<string, Profile | null>(async (ids) => {
            const profiles = await prisma.profile.findMany({
                where: { id: { in: Array.from(ids) } },
            });
            return ids.map((id) => profiles.find((profile) => profile.id === id) ?? null);
        }),

        postsLoader: new DataLoader<string, Post[]>(async (ids) => {
            const posts = await prisma.post.findMany({
                where: { authorId: { in: Array.from(ids) } },
            });
            return ids.map((id) => posts.filter((post) => post.authorId === id));
        }),

        postLoader: new DataLoader<string, Post | null>(async (ids) => {
            const posts = await prisma.post.findMany({
                where: { id: { in: Array.from(ids) } },
            });
            return ids.map((id) => posts.find((post) => post.id === id) ?? null);
        }),

        membersLoader: new DataLoader<string, MemberType | null>(async (ids) => {
            const memberTypes = await prisma.memberType.findMany({
                where: { id: { in: ids as string[] } },
            });
            return ids.map((id) => memberTypes.find((memberType) => memberType.id === id) ?? null);
        })
    };
};
