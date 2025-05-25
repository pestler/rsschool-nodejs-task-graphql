import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';
import { CreatePostInput, CreateUserInput, CreateProfileInput, ChangePostInput, ChangeUserInput, ChangeProfileInput } from './inputs.js';
import { PostType, UserType, ProfileType, GqlContext, ICreatePost, ICreateUser, ICreateProfile } from './types.js';

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: PostType,
      args: { dto: { type: CreatePostInput } },
      resolve: (_, { dto }: { dto: ICreatePost }, context: GqlContext) => context.prisma.post.create({ data: dto }),
    },
    changePost: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: new GraphQLNonNull(ChangePostInput) } },
      resolve: (_, { id, dto }: { id: string; dto: ICreatePost }, context: GqlContext) => context.prisma.post.update({ where: { id }, data: dto }),
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context: GqlContext) => !!(await context.prisma.post.delete({ where: { id } }).catch(() => false)),
    },
    createUser: {
      type: UserType,
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: (_, { dto }: { dto: ICreateUser }, context: GqlContext) => context.prisma.user.create({ data: dto }),
    },
    changeUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: new GraphQLNonNull(ChangeUserInput) } },
      resolve: (_, { id, dto }: { id: string; dto: ICreateUser }, context: GqlContext) => context.prisma.user.update({ where: { id }, data: dto }),
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context: GqlContext) => !!(await context.prisma.user.delete({ where: { id } }).catch(() => false)),
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: { userId: { type: new GraphQLNonNull(UUIDType) }, authorId: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { userId, authorId }: { userId: string; authorId: string }, context: GqlContext) => {
        await context.prisma.subscribersOnAuthors.create({ data: { subscriberId: userId, authorId } });
        return 'done';
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      resolve: async (_, { userId, authorId }: { userId: string; authorId: string }, context: GqlContext) => !!(await context.prisma.subscribersOnAuthors.delete({ where: { subscriberId_authorId: { subscriberId: userId, authorId } } }).catch(() => false)),
    },
    createProfile: {
      type: ProfileType,
      args: { dto: { type: CreateProfileInput } },
      resolve: (_, { dto }: { dto: ICreateProfile }, context: GqlContext) => context.prisma.profile.create({ data: dto }),
    },
    changeProfile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangeProfileInput } },
      resolve: (_, { id, dto }: { id: string; dto: Partial<ICreateProfile> }, context: GqlContext) => context.prisma.profile.update({ where: { id }, data: dto }),
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_, { id }: { id: string }, context: GqlContext) => !!(await context.prisma.profile.delete({ where: { id } }).catch(() => false)),
    },
  },
});
