import { GraphQLServer } from 'graphql-yoga';


import prisma from './config/prisma';
import { 
    schema, 
    resolvers, 
    fragmentReplacements } from './config/graphqlConfig';
import { 
    specificMiddlewares_1,
    specificMiddlewares_2,
    specificMiddlewares_3, 
    all_parseJWT } from './middlewares/graphql.middleware';


const server = new GraphQLServer({ 
    typeDefs: schema, 
    resolvers: resolvers,
    fragmentReplacements,
    middlewares: [
        all_parseJWT,
        specificMiddlewares_1,
        specificMiddlewares_2,
        specificMiddlewares_3
    ],
    context: req => ({ 
        req, 
        db: prisma
    })
});

export { server as default };