import { GraphQLNonNull, GraphQLList, GraphQLObjectType } from 'graphql';
import {
  PostType,
  UserType,
  ProfileType,
  GqlContext,
  MemberType,
  MemberTypeId,
  MemberTypeIdType,
} from './types/types.js';
import { UUIDType } from './types/uuid.js';

import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { User } from '@prisma/client';
import { UUID } from 'crypto';

export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, context: GqlContext, info) => {
        try {
          const resolveTree = parseResolveInfo(info) as ResolveTree;
          const { fields } = simplifyParsedResolveInfoFragmentWithType(resolveTree, info.returnType);
          const include = {
          userSubscribedTo: 'userSubscribedTo' in fields,
          subscribedToUser: 'subscribedToUser' in fields,
        };

          const users: User[] = await context.prisma.user.findMany({ include });

          users.forEach(user => {
            context.loaders.userLoader.prime(user.id as UUID, user);
          });

          return users;
        } catch (error) {
          console.error("Error fetching users:", error);
          throw new Error("Failed to fetch users.");
        }
      },
    },

    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id: userId }: { id: string }, context: GqlContext) => {
        try {
          return await context.loaders.userLoader.load(userId);
        } catch (error) {
          console.error(`Error fetching user by ID ${userId}:`, error);
          throw new Error("Failed to fetch user.");
        }
      },
    },

    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_, __, context: GqlContext) => {
        try {
          return await context.prisma.profile.findMany();
        } catch (error) {
          console.error("Error fetching profiles:", error);
          throw new Error("Failed to fetch profiles.");
        }
      },
    },

    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id: profileId }: { id: string }, context: GqlContext) => {
        try {
          return await context.loaders.profileIdLoader.load(profileId);
        } catch (error) {
          console.error(`Error fetching profile by ID ${profileId}:`, error);
          throw new Error("Failed to fetch profile.");
        }
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, context: GqlContext) => {
        try {
          return await context.prisma.post.findMany();
        } catch (error) {
          console.error("Error fetching posts:", error);
          throw new Error("Failed to fetch posts.");
        }
      },
    },

    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id: postId }: { id: string }, context: GqlContext) => {
        try {
          return await context.loaders.postLoader.load(postId);
        } catch (error) {
          console.error(`Error fetching post by ID ${postId}:`, error);
          throw new Error("Failed to fetch post.");
        }
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_, __, context: GqlContext) => {
        try {
          return await context.prisma.memberType.findMany();
        } catch (error) {
          console.error("Error fetching member types:", error);
          throw new Error("Failed to fetch member types.");
        }
      },
    },

    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_, { id: memberTypeId }: { id: MemberTypeIdType }, context: GqlContext) => {
        try {
          return await context.loaders.membersLoader.load(memberTypeId);
        } catch (error) {
          console.error(`Error fetching member type by ID ${memberTypeId}:`, error);
          throw new Error("Failed to fetch member type.");
        }
      },
    },
  },
});

