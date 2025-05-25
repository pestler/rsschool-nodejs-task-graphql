import { Type } from '@fastify/type-provider-typebox';
import { GraphQLSchema } from 'graphql';

import { Mutation } from './types/mutations.js';
import { Query } from './queries.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Unknown(),
    errors: Type.Unknown(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const gqlRootSchema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
