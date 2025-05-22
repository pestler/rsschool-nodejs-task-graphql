import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, gqlRootSchema } from './schemas.js';
import { graphql } from 'graphql';
import { prismaLoaders } from './loaders.js';


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  const loaders = prismaLoaders(prisma);

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      try {
        const { query, variables } = req.body;

        if (!query) {
          throw httpErrors.badRequest("Query is required.");
        }

        if (!prisma) {
          throw httpErrors.internalServerError("Prisma client not initialized.");
        }

        const result = await graphql({
          schema: gqlRootSchema,
          source: query,
          variableValues: variables ?? {},
          contextValue: { prisma, loaders },
        });

        return reply.send(result);
      } catch (error) {
        console.error("GraphQL execution error:", error);
        return reply.status(500).send({ errors: [{ message: "Internal Server Error." }] });
      }
    },
  });
};

export default plugin;
