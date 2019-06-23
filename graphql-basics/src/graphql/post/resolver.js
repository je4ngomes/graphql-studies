import uuidv4 from 'uuid/v4';

const posts = (parent, { filterBy }, { db }) => {
    return filterBy 
        ? db.posts.filter(
            x => x.title.toLocaleLowerCase()
                    .includes(filterBy.toLocaleLowerCase())) ||
                    x.body.toLocaleLowerCase()
                    .includes(filterBy.toLocaleLowerCase())
        : db.posts;
};

const post = () => ({ 
    id: 'asd54A', 
    title: 'Test Articles',
    body: 'Incididunt velit non sunt nisi id qui.',
    published: false
});

const createPost = (parent, args, { db, pubsub }) => {
    const userExist = db.users.some(user => user.id === args.data.author);

    if (!userExist)
        throw new Error('User not found.');
    
    const newPost = { id: uuidv4(), ...args.data };

    db.posts.push(newPost);
    newPost.published && pubsub.publish('post', { post: { data: newPost, mutation: 'CREATED' } });

    return newPost;
};

const updatePost = (parent, args, { db }) => {

};

const subscribe = (parent, args, { pubsub }) => pubsub.asyncIterator('post');

const author = (parent, args, { db }) => db.users.find(user => user.id === parent.author);
const comments = (parent, args, { db }) => db.comments.filter(commt => commt.post === parent.id);

export default {
    Query: {
        posts,
        post
    },
    Mutation: {
        createPost,
        updatePost
    },
    Subscription: {
        post: { subscribe }
    },
    Post: {
        author,
        comments
    }
};