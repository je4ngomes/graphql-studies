import bcrypt from 'bcryptjs';

import { AuthenticationError } from '../errors/errors';
import { getUserId, generateToken } from '../../../utils/utils';

// QUERY
const users = (parent, { query, ...args }, { db, req }, info) => {
    const opArgs = {
        where: query 
            ? { name_contains: query }  
            : null,
        ...args
    };

    return db.query.users(opArgs, info);
};

const me = (parent, args, { db, req }, info) => db.query.user({ where: { id: req.user.id } }, info);

// MUTATION
const signUp = (parent, { data }, { db }, info) =>
    db.mutation.createUser({ data })
        .then(user => ({
            user,
            token: generateToken({ id: user.id })
        }));

const signIn = (parent, { data: { email, password } }, { db }, info) =>
    db.query.user({ where: { email } })
        .then(user => {
            if (!user)
                throw new AuthenticationError({ message: 'User does not exist.' });

            return bcrypt.compare(password, user.password)
                        .then(isMatch => {
                            if (!isMatch)
                                throw new AuthenticationError({ message: 'The provided credentials are invalid.' });

                            return user;
                        });
        })
        .then(user => ({ user, token: generateToken({ id: user.id }) }));

const updateUser = (parent, { data }, { db, req }, info) =>
    db.mutation.updateUser({
        where: { 
            id: req.user.id 
        }, 
        data 
    }, info);

const deleteUser = (parent, args, { db, req }, info) => 
    db.mutation.deleteUser({ where: { id: req.user.id } }, info);

// TYPE FIELD
const email = {
    fragment: 'fragment userId on User { id }',
    resolve(parent, args, { db, req }, info) {
        const userId = getUserId(req);

        return parent.id === userId 
                ? parent.email 
                : null
    }
};

const posts = {
    fragment: 'fragment userId on User { id }',
    resolve: (parent, args, { db }, info) =>
        db.query.posts({ where: { published: true, author: { id: parent.id } } }, info)
        
};

export default {
    Query: {
        users,
        me
    },
    Mutation: {
        signUp,
        signIn,
        deleteUser,
        updateUser
    },
    User: {
        email,
        posts
    }
};
