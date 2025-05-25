import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, gqlRootSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { prismaLoaders } from './loaders.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  const loaders = prismaLoaders(prisma);
  if (!loaders) throw httpErrors.internalServerError("Loaders initialization failed.");

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: { 200: gqlResponseSchema },
    },
    async handler(req, reply) {
      try {
        const { query, variables } = req.body;

        if (!query) throw httpErrors.badRequest("Query is required.");
        if (!prisma) throw httpErrors.internalServerError("Prisma client not initialized.");

        const validationErrors = validate(gqlRootSchema, parse(query), [depthLimit(5)]);
        if (validationErrors.length > 0) return reply.send({ errors: validationErrors });

        const result = await graphql({
          schema: gqlRootSchema,
          source: query,
          variableValues: variables ?? {},
          contextValue: { prisma, loaders },
        });

        return reply.send(result);
      } catch (error) {
        console.error("GraphQL execution error:", error);
        return reply.code(500).send({ errors: [{ message: "Internal Server Error." }] });
      }
    },
  });
};

export default plugin;
