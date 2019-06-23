import { NotFound } from '../errors/errors';
import { getUserId } from '../../../utils/utils';

// QUERY
const post = (parent, { id }, { db, req }, info) =>
    db.query.posts({
        where: {
            id,
            OR: [{ published: true }, { author: { id: getUserId(req) } }]
        }
    }).then(posts => {
        if (posts.length === 0) throw new NotFound({ message: 'Post not found.' });

        return posts[0];
    });

const posts = (parent, { query, ...args }, { db }, info) => {
    const defaultWhere = { published: true };
    const opArgs = {
        where: query 
            ? { OR: [{ title_contains: query }, { body_contains: query }], ...defaultWhere } 
            : defaultWhere,
        ...args
    };
    
    return db.query.posts(opArgs, info);
};

const myPosts = (parent, { query, ...args }, { db, req }, info) => {
    const defaultWhere = { author: { id: req.user.id } };
    const opArgs = {
        where: query 
            ? { OR: [{ title_contains: query }, { body_contains: query }], ...defaultWhere } 
            : defaultWhere,
        ...args
    };
    
    return db.query.posts(opArgs, info);
};

// MUTATION
const createPost = (parent, { data }, { db, pubsub, req }, info) =>
    db.mutation
        .createPost({ 
            data: {
                ...data, 
                author: { 
                    connect: { id: req.user.id } 
                }
            }
        }, info);

const updatePost = (parent, { id, data }, { db, req }, info) =>
    Promise.all([
        db.exists.Post({ id, author: { id: req.user.id } }),
        db.exists.Post({ id, published: true })
    ]).then(([ postExists, isPublished ]) => {
        if (!postExists)
            throw new NotFound({ message: 'Unable to update post.' });

        // if published, but about to be unpublished, delete all comments of it as well
        if (!data.published && isPublished)
            db.mutation.deleteManyComments({ where: { post: { id } } });
        
        return db.mutation.updatePost({ where: { id }, data }, info);
    });

const deletePost = (parent, { id }, { db, req }, info) =>
    db.exists.Post({ id, author: { id: req.user.id } })
        .then(exists => {
            if (!exists)
                throw new NotFound({ message: 'Unable to delete post.' });

            return db.mutation.deletePost({ where: { id } }, info);
        });

// SUBSCRIPTION
const PostSubscribe = (parent, args, { db }, info) => 
    db.subscription.post({
        where: {
            node: {
                published: true
            }
        }
    }, info);

const myPostSubscribe = (parent, args, { db, req }, info) =>
    db.subscription.post({
        where: {
            node: {
                author: { id: req.user.id }
            }
        }
    }, info);

export default {
    Query: {
        post,
        posts,
        myPosts
    },
    Mutation: {
        createPost,
        updatePost,
        deletePost
    },
    Subscription: {
        post: { subscribe: PostSubscribe },
        myPost: { subscribe: myPostSubscribe }
    }
};