import * as GraphQL from 'graphql';
import { UUIDType } from './uuid.js';
import * as PrismaTypes from '@prisma/client';
import DataLoader from 'dataloader';

export const PostType = new GraphQL.GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQL.GraphQLString },
    content: { type: GraphQL.GraphQLString },
    authorId: { type: UUIDType },
  }),
});

type Loaders = {
  userLoader: DataLoader<string, PrismaTypes.User>;
  profileLoader: DataLoader<string, PrismaTypes.Profile>;
  profileIdLoader: DataLoader<string, PrismaTypes.Profile>;
  membersLoader: DataLoader<string, PrismaTypes.MemberType>;
  memberLoader: DataLoader<string, PrismaTypes.MemberType>;
  postsLoader: DataLoader<string, PrismaTypes.Post>;
  postLoader: DataLoader<string, PrismaTypes.Post>;
};

export type GqlContext = {
  prisma: PrismaTypes.PrismaClient;
  loaders: Loaders;
};

export const UserType: GraphQL.GraphQLObjectType = new GraphQL.GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQL.GraphQLNonNull(UUIDType) },
    name: { type: new GraphQL.GraphQLNonNull(GraphQL.GraphQLString) },
    balance: { type: new GraphQL.GraphQLNonNull(GraphQL.GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (parent: IUser, _, context: GqlContext) => {
        try {
          return await context.loaders.profileLoader.load(parent.id);
        } catch (error) {
          console.error(`Error loading profile for user ${parent.id}:`, error);
          return null;
        }
      },
    },
    posts: {
      type: new GraphQL.GraphQLList(PostType),
      resolve: async (parent: IUser, _, context: GqlContext) => {
        try {
          return await context.loaders.postsLoader.load(parent.id);
        } catch (error) {
          console.error(`Error loading posts for user ${parent.id}:`, error);
          return [];
        }
      },
    },
    userSubscribedTo: {
      type: new GraphQL.GraphQLNonNull(new GraphQL.GraphQLList(new GraphQL.GraphQLNonNull(UserType))),
      resolve: async (parent: IUser, _args, context: GqlContext) => {
        try {
          return context.loaders.userLoader.loadMany(parent.userSubscribedTo?.map(s => s.authorId) ?? []);
        } catch (error) {
          console.error(`Error fetching subscriptions for user ${parent.id}:`, error);
          return [];
        }
      },
    },
    subscribedToUser: {
      type: new GraphQL.GraphQLNonNull(new GraphQL.GraphQLList(new GraphQL.GraphQLNonNull(UserType))),
      resolve: async (parent: IUser, _args, context: GqlContext) => {
        try {
          return context.loaders.userLoader.loadMany(parent.subscribedToUser?.map(s => s.subscriberId) ?? []);
        } catch (error) {
          console.error(`Error fetching subscribers for user ${parent.id}:`, error);
          return [];
        }
      },
    },
  }),
});

export const MemberTypeId = new GraphQL.GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType = new GraphQL.GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQL.GraphQLFloat },
    postsLimitPerMonth: { type: GraphQL.GraphQLInt },
  }),
});

export const ProfileType = new GraphQL.GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQL.GraphQLBoolean },
    yearOfBirth: { type: GraphQL.GraphQLInt },
    memberTypeId: { type: GraphQL.GraphQLString },
    memberType: {
      type: MemberType,
      resolve: async (parent: { memberTypeId: string }, _, context: GqlContext) => {
        return await context.loaders.membersLoader.load(parent.memberTypeId);
      },
    },
  }),
});

export enum MemberTypeIdType {
  BASIC = 'BASIC',
  BUSINESS = 'BUSINESS',
}

export interface ICreateProfile {
  userId: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
}

export interface ICreatePost {
  title: string;
  content: string;
  authorId: string;
}

export interface ICreateUser {
  name: string;
  balance: number;
}

export interface UserSubscriptions extends PrismaTypes.User {
  userSubscribedTo?: { subscriberId: string; authorId: string }[];
  subscribedToUser?: { subscriberId: string; authorId: string }[];
}

interface ISubscriptions {
  subscriberId: string;
  authorId: string;
}

export interface IUser {
  id: string;
  name: string;
  balance: number;
  profile?: IProfile | null;
  posts?: IPost[] | [];
  userSubscribedTo?: ISubscriptions[];
  subscribedToUser?: ISubscriptions[];
}

interface IProfile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberType: IMemberType;
}

interface IMemberType {
  id: MemberTypeIdType;
  discount: number;
  postsLimitPerMonth: number;
}

interface IPost {
  id: string;
  title: string;
  content: string;
}
