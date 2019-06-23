import { gql } from "apollo-boost";

const signUp = gqll `
    mutation($data: SignUpUserInput!) {
        signUp(data: $data) {
            token
            user { id }
        }
    }
`;

const signIn = gql `
    mutation($data: SignInUserInput) {
        signIn(data: $data) {
            token
            user {
                id
            }
        }
    }
`;

const getProfile = gql `
    query {
        me {
            id
            name
            email
        }
    }
`;

export {
    signUp,
    signIn,
    getProfile
};