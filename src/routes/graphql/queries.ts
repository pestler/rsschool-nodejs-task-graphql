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
        const resolveTree = parseResolveInfo(info) as ResolveTree;
        const { fields } = simplifyParsedResolveInfoFragmentWithType(
          resolveTree,
          info.returnType,
        );
        const include = {
          userSubscribedTo: 'userSubscribedTo' in fields,
          subscribedToUser: 'subscribedToUser' in fields,
        };

        const users: User[] = await context.prisma.user.findMany({
          include,
        });

        users.forEach((user) => {
          context.loaders.userLoader.prime(user.id as UUID, user);
        });

        return users;
      },
    },

    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id: userId }: { id: string }, context: GqlContext) => {
        return await context.loaders.userLoader.load(userId);
      },
    },

    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_, __, context: GqlContext) => {
        return await context.prisma.profile.findMany();
      },
    },

    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id: profileId }: { id: string }, context: GqlContext) => {
        return context.loaders.profileIdLoader.load(profileId);
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, context: GqlContext) => {
        return context.prisma.post.findMany();
      },
    },

    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id: postId }: { id: string }, context: GqlContext) => {
        return await context.loaders.postLoader.load(postId);
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_, args, context: GqlContext) => {
        return await context.prisma.memberType.findMany();
      },
    },

    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (
        _,
        { id: MemberTypeId }: { id: MemberTypeIdType },
        context: GqlContext,
      ) => {
        return await context.loaders.membersLoader.load(MemberTypeId);
      },
    },
  },
});
