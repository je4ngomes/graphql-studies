import "cross-fetch/polyfill"
import { gql } from 'apollo-boost';

import seedDatabase, { userOne, postOne } from './utils/seedDatabase';
import prisma from '../src/config/prisma';
import getClient from "./utils/getClient";


const client = getClient();

beforeEach(seedDatabase);

test('Should expose published posts', done => {
    const getPosts = gql `
        query {
            posts {
                id
                title
                body
                published
            }
        }
    `;

    client.query({ query: getPosts })
        .then(({ data: { posts } }) => {
            expect(posts.length).toBe(1);
            expect(posts[0].published).toBe(true);
            done();
        });
}, 10000);

test('Should fetch user posts', done => {
    const client = getClient(userOne.jwt);
    const userPosts = gql `
        query {
            myPosts {
                title
                id
            }
        }
    `;

    client.query({ query: userPosts })
        .then(({ data }) => {
            expect(data.myPosts.length).toBe(2);
            done();
        })
}, 10000);

test('Should be able to update own post', done => {
    const client = getClient(userOne.jwt);
    const updatePost = gql `
        mutation {
            updatePost(id: "${postOne.post.id}", data: { published: false }) {
                published
            }
        }
    `;
    // check if post is unpublished directly on the database
    // expect published property to be false
    Promise.all([
        prisma.exists.Post({ id: postOne.post.id }),
        client.mutate({ mutation: updatePost })
    ]).then(([exists, { data }]) => {
        expect(exists).toBe(true);
        expect(data.updatePost.published).toBe(false);

        done();
    });
}, 10000);

test('Should be able to create own post', done => {
    const client = getClient(userOne.jwt);
    const createPost = gql `
        mutation {
            createPost(data: { 
                title: "Creating post test", 
                body: "", 
                published: false 
            }) {
                published
                body
            }
        }
    `;

    client.mutate({ mutation: createPost })
        .then(({ data: { createPost } }) => {
            expect(createPost.published).toBe(false);

            done();
        });
}, 10000);

test('Should be able to delete own post', done => {
    const client = getClient(userOne.jwt);
    const deletePost = gql `
        mutation {
            deletePost(id: "${postOne.post.id}") {
                id
            }
        }
    `;

    client.mutate({ mutation: deletePost })
        .then(async ({ data: { deletePost } }) => {
            expect(await prisma.exists.Post({ id: deletePost.id })).toBe(false);

            done();
        });
}, 10000);