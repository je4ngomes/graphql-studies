import '@babel/polyfill';
import { formatError } from 'apollo-errors';
import server from './server';

const port = process.env.PORT || 3005;
server.start(
    { port, formatError },
    () => console.log(`Listening on port ${port}`)
);