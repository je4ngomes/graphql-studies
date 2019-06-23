import '@babel/polyfill';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../src/config/prisma';

const userOne = {
    input: {
        email: 'jen@example.com',
        name: 'Jen',
        password: bcrypt.hashSync('1233Afcc&(')
    },
    user: undefined,
    jwt: undefined
};

const userTwo = {
    input: {
        email: 'jane@example.com',
        name: 'Jane',
        password: bcrypt.hashSync('aadJkl782')
    },
    user: undefined,
    jwt: undefined
};

const postOne = {
    input: {
        title: "Graphql Test Cases Part I",
        body: "",
        published: true,
    },
    post: undefined
};

const postTwo = {
    input: {
        title: "Graphql Test Cases Part II",
        body: "",
        published: false,
    },
    post: undefined
};

const commentOne = {
    input: {
        text: "Comment I"
    },
    comment: undefined
};

const commentTwo = {
    input: {
        text: "Comment II"
    },
    comment: undefined
};

const seedDatabase = () => {
    const createUsers = Promise.all([
        prisma.mutation.createUser({
            data: userOne.input
        }),
        prisma.mutation.createUser({
            data: userTwo.input
        })
    ]);

    // Delete test data
    // Create user one
    // Create posts
    prisma.mutation.deleteManyPosts()
        .then(_ => prisma.mutation.deleteManyUsers())
        .then(_ => prisma.mutation.deleteManyComments())
        .then(_ => createUsers)
        .then(([userOne, userTwo]) => {
            userOne.jwt = jwt.sign({ id: userOne.user.id }, process.env.JWT_SECRET);
            userTwo.jwt = jwt.sign({ id: userTwo.user.id }, process.env.JWT_SECRET);
        })
        .then(async () => {
            postOne.post = await prisma.mutation.createPost({
                data: {
                    ...postOne.input,
                    author: {
                        connect: {
                            id: userOne.user.id
                        }
                    }
                }
            });
        })
        .then(async () => {
            postTwo.post = await prisma.mutation.createPost({
                data: {
                    ...postTwo.input,
                    author: {
                        connect: {
                            id: userOne.user.id
                        }
                    }
                }
            })
        })
        .then(() => {
            commentOne.comment = await prisma.mutation.createComment({
                data: { 
                    ...commentOne.input,
                    author: {
                        connect: {
                            id: userOne.user.id
                        }
                    },
                    post: {
                        connect: {
                            id: postOne.post.id
                        }
                    }
                }
            })
        })
        .then(() => {
            commentTwo.comment = await prisma.mutation.createComment({
                data: {
                    ...commentTwo.input,
                    author: {
                        connect: {
                            id: userTwo.user.io
                        }
                    },
                    post: {
                        connect: {
                            id: postOne.post.id
                        }
                    }
                }
            })
        });
};

export { seedDatabase as default, userOne, postOne };