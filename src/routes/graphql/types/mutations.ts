import {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import {
  CreatePostInput,
  CreateUserInput,
  CreateProfileInput,
  ChangePostInput,
  ChangeUserInput,
  ChangeProfileInput,
} from './inputs.js';
import {
  PostType,
  UserType,
  ProfileType,
  GqlContext,
  ICreatePost,
  ICreateUser,
  ICreateProfile,
} from './types.js';

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: PostType,
      args: {
        dto: { type: CreatePostInput },
      },
      async resolve(_, { dto }: { dto: ICreatePost }, context: GqlContext) {
        try {
          return await context.prisma.post.create({ data: dto });
        } catch (error) {
          console.error("Error creating post:", error);
          throw new Error("Failed to create post.");
        }
      },
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      async resolve(_, { id, dto }: { id: string; dto: Partial<ICreatePost> }, context: GqlContext) {
        try {
          return await context.prisma.post.update({ where: { id }, data: dto });
        } catch (error) {
          console.error("Error updating post:", error);
          throw new Error("Failed to update post.");
        }
      },
    },
    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, { id }: { id: string }, context: GqlContext) {
        try {
          await context.prisma.post.delete({ where: { id } });
          return true;
        } catch (error) {
          console.error("Error deleting post:", error);
          return false;
        }
      },
    },
    createUser: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      async resolve(_, { dto }: { dto: ICreateUser }, context: GqlContext) {
        try {
          return await context.prisma.user.create({ data: dto });
        } catch (error) {
          console.error("Error creating user:", error);
          throw new Error("Failed to create user.");
        }
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      async resolve(_, { id, dto }: { id: string; dto: Partial<ICreateUser> }, context: GqlContext) {
        try {
          return await context.prisma.user.update({ where: { id }, data: dto });
        } catch (error) {
          console.error("Error updating user:", error);
          throw new Error("Failed to update user.");
        }
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, { id }: { id: string }, context: GqlContext) {
        try {
          await context.prisma.user.delete({ where: { id } });
          return true;
        } catch (error) {
          console.error("Error deleting user:", error);
          return false;
        }
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        args: { userId: string; authorId: string },
        context: GqlContext,
      ) => {
        const { userId: subscriberId, authorId } = args;
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: subscriberId,
            authorId: authorId,
          },
        });
        return 'done';
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: UUIDType },
        authorId: { type: UUIDType },
      },
      resolve: async (
        _,
        args: { userId: string; authorId: string },
        context: GqlContext,
      ) => {
        const { userId: subscriberId, authorId } = args;
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId,
              authorId,
            },
          },
        });
        return true;
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: { type: CreateProfileInput },
      },
      async resolve(_, { dto }: { dto: ICreateProfile }, context: GqlContext) {
        try {
          return await context.prisma.profile.create({ data: dto });
        } catch (error) {
          console.error("Error creating profile:", error);
          throw new Error("Failed to create profile.");
        }
      },
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: ChangeProfileInput },
      },
      async resolve(_, { id, dto }: { id: string; dto: Partial<ICreateProfile> }, context: GqlContext) {
        try {
          return await context.prisma.profile.update({ where: { id }, data: dto });
        } catch (error) {
          console.error("Error updating profile:", error);
          throw new Error("Failed to update profile.");
        }
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: UUIDType },
      },
      async resolve(_, { id }: { id: string }, context: GqlContext) {
        try {
          await context.prisma.profile.delete({ where: { id } });
          return true;
        } catch (error) {
          console.error("Error deleting profile:", error);
          return false;
        }
      },
    },
  },
});

