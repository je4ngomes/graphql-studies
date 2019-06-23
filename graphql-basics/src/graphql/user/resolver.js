import uuidv4 from 'uuid/v4';

const me = () => ({ 
    id: '125Afc4', 
    name: 'Jean', 
    email: 'asdsds@gmail.com' 
});

const users = (parent, { filterBy }, { db }) => {
    return filterBy 
        ? db.users.filter(
            x => x.name.toLocaleLowerCase()
                    .includes(filterBy.toLocaleLowerCase()))
        : db.users;
};

const createUser = (parent, args, { db }) => {
    const emailTaken = db.users.some(user => user.email === args.data.email);
    const user = { id: uuidv4(), ...args.data };

    if (emailTaken)
        throw new Error('Email Taken.');

    db.users.push(user);

    return user;    
};

const updateUser = (parent, args, { db }) => {

};

const posts = (parent, _, { db }) => db.users.filter(post => post.author === parent.id);
const comments = (parent, _, { db }) => db.users.filter(commt => commt.author === parent.id);

export default {
    Query: {
        me,
        users
    },
    Mutation: {
        createUser,
        updateUser
    },
    User: {
        posts,
        comments   
    }    
};