import ApolloClient, { gql } from 'apollo-boost';

const client = new ApolloClient({
    uri: 'http://localhost:3005'
});

const getUsers = gql `
    query {
        users {
            id
            name
        }
    }
`;

client.query({
    query: getUsers
}).then(res => console.log(res.data))