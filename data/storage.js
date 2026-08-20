const crypto = require('crypto');

const users = [];
const posts = [];

const createUser = ({ username, email, password, role = 'user' }) => {
    const user = { id: crypto.randomUUID(), username, email, password, role, createdAt: new Date().toISOString() };
    users.push(user);
    return user;
};

const createPost = ({ title, content, platform, mediaUrl, tags, scheduledAt, status, author }) => {
    const post = {
        id: crypto.randomUUID(),
        title,
        content,
        platform,
        mediaUrl,
        tags,
        scheduledAt,
        status: status || (scheduledAt ? 'scheduled' : 'draft'),
        author,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    posts.push(post);
    return post;
};

const updatePost = (id, author, updates) => {
    const post = posts.find((item) => item.id === id && item.author === author);
    if (!post) return null;
    Object.assign(post, updates, { updatedAt: new Date().toISOString() });
    return post;
};

const deletePost = (id, author) => {
    const index = posts.findIndex((item) => item.id === id && item.author === author);
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
};

const findPost = (id) => posts.find((item) => item.id === id);

module.exports = {
    users,
    posts,
    createUser,
    createPost,
    updatePost,
    deletePost,
    findPost,
};
