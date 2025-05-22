import * as GraphQL from 'graphql';
import { UUIDType } from './uuid.js';
import * as Inputs from './inputs.js';
import * as Types from './types.js';

export const Mutation = new GraphQL.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: Types.PostType,

      args: { dto: { type: new GraphQL.GraphQLNonNull(Inputs.CreatePostInput) } },
      async resolve(_, { dto }: { dto: Types.ICreatePost }, context: Types.GqlContext) {
        try {
          return await context.prisma.post.create({ data: dto });
        } catch (error) {
          console.error("Error creating post:", error);
          throw new Error("Failed to create post.");
        }
      },
    },
    changePost: {
      type: Types.PostType,
      args: {
        id: { type: new GraphQL.GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQL.GraphQLNonNull(Inputs.ChangePostInput) },
      },
      async resolve(_, { id, dto }: { id: string; dto: Partial<Types.ICreatePost> }, context: Types.GqlContext) {
        try {
          return await context.prisma.post.update({ where: { id }, data: dto });
        } catch (error) {
          console.error("Error updating post:", error);
          throw new Error("Failed to update post.");
        }
      },
    },
    deletePost: {
      type: GraphQL.GraphQLBoolean,
      args: { id: { type: new GraphQL.GraphQLNonNull(UUIDType) } },
      async resolve(_, { id }: { id: string }, context: Types.GqlContext) {
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
      type: Types.UserType,
      args: { dto: { type: new GraphQL.GraphQLNonNull(Inputs.CreateUserInput) } },
      async resolve(_, { dto }: { dto: Types.ICreateUser }, context: Types.GqlContext) {
        try {
          return await context.prisma.user.create({ data: dto });
        } catch (error) {
          console.error("Error creating user:", error);
          throw new Error("Failed to create user.");
        }
      },
    },
    subscribeTo: {
      type: new GraphQL.GraphQLNonNull(GraphQL.GraphQLString),
      args: {
        userId: { type: new GraphQL.GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQL.GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { userId: string; authorId: string }, context: Types.GqlContext) {
        try {
          const { userId: subscriberId, authorId } = args;
          await context.prisma.subscribersOnAuthors.create({
            data: { subscriberId, authorId },
          });
          return 'done';
        } catch (error) {
          console.error("Error subscribing:", error);
          throw new Error("Failed to subscribe.");
        }
      },
    },
    unsubscribeFrom: {
      type: GraphQL.GraphQLBoolean,
      args: {


        userId: { type: new GraphQL.GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQL.GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { userId: string; authorId: string }, context: Types.GqlContext) {
        try {
          const { userId: subscriberId, authorId } = args;
          await context.prisma.subscribersOnAuthors.delete({
            where: { subscriberId_authorId: { subscriberId, authorId } },
          });
          return true;
        } catch (error) {
          console.error("Error unsubscribing:", error);
          return false;
        }
      },
    },
  },

});
