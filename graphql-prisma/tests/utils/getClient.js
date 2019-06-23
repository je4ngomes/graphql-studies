import ApolloBoost from 'apollo-boost';

export default jwt => new ApolloBoost({ 
    uri: 'http://localhost:3005',
    request(operation) {
        jwt && operation.setContext({ headers: { authorization: `Bearer ${jwt}` } });
    }
});
