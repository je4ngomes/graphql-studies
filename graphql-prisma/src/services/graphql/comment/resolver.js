import { NotFound } from '../errors/errors';

// QUERY
const comments = (_, args, { db }, info) => db.query.comments(args, info);

// MUTATION
const createComment = (_, { data }, { db, pubsub, req }, info) =>
    db.exists.Post({ id: data.post, published: true })
        .then(exists => {
            if (!exists)
                throw new NotFound({ message: 'Unable to find post' });

            return db.mutation.createComment({ 
                data : {
                    ...data, 
                    author: { 
                        connect: { id: req.user.id } 
                    },
                    post: {
                        connect: { 
                            id: data.post
                        }
                    }
                }
            },info);
        });

const updateComment = (_, { id, data }, { db, req }, info) =>
    db.exists.Comment({ id, author: { id: req.user.id } })
        .then(exists => {
            if (!exists)
                throw new NotFound({ message: 'Unable to update comment.' });

            return db.mutation.updateComment({ where: { id }, data }, info)
        });

const deleteComment = (_, { id }, { db, req }, info) =>
    db.exists.Comment({ id, author: { id: req.user.id } })
        .then(exists => {
            if (!exists)
                throw new NotFound({ message: 'Unable to delete comment.' });

            return db.mutation.deleteComment({ where: { id } }, info);
        });
 
// SUBSCRIPTION
const subscribe = (_, args, { db }, info) => 
    db.subscription.comment({
        where: {
            node: {
                post: { id: args.id }
            }
        }
    }, info);

export default {
    Query: {
        comments
    },
    Mutation: {
        createComment,
        deleteComment,
        updateComment
    },
    Subscription: {
        comment: { subscribe }
    }
};