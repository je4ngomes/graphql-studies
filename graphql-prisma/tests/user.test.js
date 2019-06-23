import "cross-fetch/polyfill";
import "@babel/polyfill";


import prisma from '../src/config/prisma';
import seedDatabase, { userOne } from './utils/seedDatabase';
import getClient from './utils/getClient';
import { signUp, signIn, getProfile } from './utils/operations';

const client = getClient();

beforeEach(seedDatabase);

test('Should create a new user', done => {
    const variables = {
        data: {
            email: "cacrcnlovs@fjgfg.com",
            name: "Tesla3",
            password: "asAfdfdfd2c"
        }
    };

    client.mutate({ mutation: signUp, variables })
        .then(res =>
            prisma.exists.User({ id: res.data.signUp.user.id })
                .then(exists => {
                    expect(exists).toBe(true)
                    done();
                })
        );
}, 10000);

test('Should expose public author profiles', done => {
    const getUsers = gql `
        query {
            users {
                id
                name
                email
            }
        }
    `;

    client.query({ query: getUsers })
        .then(({ data: { users } }) => {
            expect(users.length).toBe(1);
            expect(users[0].email).toBe(null);
            done();
        });
}, 10000);

test('Should not login with bad credentials', done => {
    const variables = { 
        email: "tesladfdff.com", 
        password: "1234586547"
    };

    expect(client.mutate({ mutation: signIn, variables }))
        .rejects
        .toThrow()
        .then(_ => done())

}, 10000);

test('Should not signUp with password less than 8 characters', done => {
    const variables = {
        email: "cacrcnlovs@fjgfg.com",
        name: "Tesla3",
        password: "1234567"
    }

    expect(client.mutate({ mutation: signUp, variables }))
        .rejects
        .toThrow()
        .then(_ => done());
}, 10000);

test('Should fetch user profile', done => {
    const client = getClient(userOne.jwt);
    
    client.query({ query: getProfile })
        .then(({ data }) => {
            expect(data.me.id).toBe(userOne.user.id);
            expect(data.me.name).toBe(userOne.user.name);
            expect(data.me.email).toBe(userOne.user.email);
            done();
        })
        
}, 10000);
