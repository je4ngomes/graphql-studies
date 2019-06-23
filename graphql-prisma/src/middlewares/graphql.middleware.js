import validate, { validator, isNotValid } from 'validator-handler';
import { isEmpty, pick } from 'ramda';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { InputInvalidError, AuthorizationError } from '../services/graphql/errors/errors';

const validateUserInput = (resolve, parent, { data }) => {
    const keys = Object.keys(data);
    const validations = pick(
        keys, 
        { password: ["Password must be 8 characters or longer.", (x) => x.length >= 8],
          email: ["Invalid email address", validator.isEmail ],
          name: ['Name is required', validator.notEmpty] }
    );
    
    const results = validate(data, validations);

    if (isNotValid(results))
        throw new InputInvalidError({ data: results });
    
    return resolve();
};

const isAuthenticated = (...args) => {
    const [resolve,,, { req }] = args;
    
    if (!req.isAuthenticated)
        throw new AuthorizationError({ message: 'Authentication required.' });

    return resolve();
};

const hashPassword = (resolve, parent, { data }, ...rest) => {
    if (!data.password)
        return resolve();

    return bcrypt
                .genSalt()
                .then(salt => bcrypt.hash(data.password, salt))
                .then(pw => resolve(parent, { data: { ...data, password: pw } }, ...rest));
};

const all_parseJWT = (...args) => {
    const [resolve,,, { req }, info] = args;
    const { request, connection = {} } = req;

    /*
     - if connection is empty then it's a request;
     - if not, check if context exists
     - if context exists, check for token, otherwise return null meaning the user isn't authenticated
    */
    const token = isEmpty(connection) 
        ? request.headers['authorization']
        : connection.context 
            ? connection.context.Authorization
            : null

    req.user = token && jwt.verify(token.slice(7), process.env.JWT_SECRET); // remove `Bearer` word from token and verify it.
    req.isAuthenticated = !!req.user; // cast to bool

    return resolve(); 
};

const specificMiddlewares_1 = {
    Query: {
        me: isAuthenticated,
        myPosts: isAuthenticated
    },
    Mutation: {
        signUp: validateUserInput,
        signIn: validateUserInput,
        createPost: isAuthenticated,
        updatePost: isAuthenticated,
        updateUser: isAuthenticated,
        deletePost: isAuthenticated,
        deleteUser: isAuthenticated,
        createComment: isAuthenticated,
        updateComment: isAuthenticated,
        deleteComment: isAuthenticated
    },
    Subscription: {
        myPost: isAuthenticated
    }
};

const specificMiddlewares_2 = {
    Mutation: {
        updateUser: validateUserInput,
        signUp: hashPassword
    }
};

const specificMiddlewares_3 = {
    Mutation: {
        updateUser: hashPassword
    }
};

export {
    specificMiddlewares_1,
    specificMiddlewares_2,
    specificMiddlewares_3,
    all_parseJWT
};