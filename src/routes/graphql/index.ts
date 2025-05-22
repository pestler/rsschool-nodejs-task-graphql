import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, gqlRootSchema } from './schemas.js';
import { graphql } from 'graphql';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      try {
        const { query, variables } = req.body;

        if (!query) {
          throw httpErrors.badRequest("Query is required.");
        }

        const result = await graphql({
          schema: gqlRootSchema,
          source: query,
          variableValues: variables ?? {},
          contextValue: { prisma },
        });

        return result;
      } catch (error) {
        console.error("GraphQL execution error:", error);
        throw httpErrors.internalServerError("Internal Server Error.");
      }
    },
  });
};

export default plugin;
