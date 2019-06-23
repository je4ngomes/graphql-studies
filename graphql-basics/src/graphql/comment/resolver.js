import uuidv4 from 'uuid/v4';

// QUERY
const comments = (parent, args, { db }) => db.comments;

// MUTATION
const createComment = (_, args, { db, pubsub }) => {
    const userNotExist = !db.users.some(user => user.id === args.data.author);
    const postNotExist = !db.posts.some(post => post.id === args.data.post);

    if (userNotExist || postNotExist)
        throw new Error('Unable to find user and post.');
    
    const comment = { id: uuidv4(), ...args.data };

    db.comments.push(comment);
    pubsub.publish(`comment-${args.data.post}`, { comment });

    return comment;  
};

const updateComment = (parent, args, { db }) => {

};

// SUBSCRIPTION
const subscribe = (parent, { postId }, { pubsub, db }) => {
    const postNotExist = !db.posts.some(post => post.id === postId && post.published);

    if (postNotExist) throw new Error('Post not found.');

    return pubsub.asyncIterator(`comment-${postId}`);
};

// COMMENT
const author = (parent, args, { db }) => db.users.find(user => user.id === parent.author);
const post = (parent, args, { db }) => db.posts.find(post => post.id === parent.post);

export default {
    Query: {
        comments
    },
    Mutation: {
        createComment,
        updateComment
    },
    Subscription: {
        comment: { subscribe }
    },
    Comment: {
        author,
        post
    }
};