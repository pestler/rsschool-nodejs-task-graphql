import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from './uuid.js';
import {
  MemberType as PrismaMemberType,
  PrismaClient,
  Profile,
  User,
  Post,
} from '@prisma/client';
import DataLoader from 'dataloader';

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

type Loaders = {
  userLoader: DataLoader<string, User>;
  profileLoader: DataLoader<string, Profile>;
  profileIdLoader: DataLoader<string, Profile>;
  membersLoader: DataLoader<string, PrismaMemberType>;
  memberLoader: DataLoader<string, PrismaMemberType>;
  postsLoader: DataLoader<string, Post>;
  postLoader: DataLoader<string, Post>;
};

export type GqlContext = {
  prisma: PrismaClient;
  loaders: Loaders;
};

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
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
      type: new GraphQLList(PostType),
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
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
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
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


export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: GraphQLString },
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

export interface UserSubscriptions extends User {
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
  subscribedToUser?: {
    subscriberId: string;
    authorId: string;
  }[];
}
interface ISubscriptions {
  subscriberId: string;
  authorId: string;
}

interface IProfile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberType: IMemberType;
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

interface IPost {
  id: string;
  title: string;
  content: string;
}

interface IMemberType {
  id: MemberTypeIdType;
  discount: number;
  postsLimitPerMonth: number;
}
