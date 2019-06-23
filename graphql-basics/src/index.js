import { GraphQLServer, PubSub } from 'graphql-yoga';

import db from './database/db';
import mergeGraphql from './utils/mergeGraphql';

const { schema, resolvers } = mergeGraphql([{ dir: `${__dirname}/graphql/**/*.js`, type: 'RESOLVERS'},
                                            { dir: `${__dirname}/graphql/**/*.graphql`, type: 'TYPES' }]);


const server = new GraphQLServer({ 
    typeDefs: schema, 
    resolvers: resolvers,
    context: { 
        db, 
        pubsub: new PubSub() 
    }
});

server.start(
    { port: 3005 }, 
    () => console.log('Listening on port 3005')
);