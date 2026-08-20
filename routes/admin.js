const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const admin = require('../middleware/admin');
const storage = require('../data/storage');

const router = express.Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

router.use(...admin);

router.get('/summary', async (req, res) => {
    if (isDbConnected()) {
        const [users, posts, scheduled] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Post.countDocuments({ status: 'scheduled' }),
        ]);
        return res.json({ users, posts, scheduled });
    }
    res.json({
        users: storage.users.length,
        posts: storage.posts.length,
        scheduled: storage.posts.filter((post) => post.status === 'scheduled').length,
    });
});

router.get('/users', async (req, res) => {
    if (isDbConnected()) {
        return res.json(await User.find({}, 'username email role createdAt').sort({ createdAt: -1 }));
    }
    res.json(storage.users.map(({ password, ...user }) => user));
});

router.get('/posts', async (req, res) => {
    if (isDbConnected()) {
        return res.json(await Post.find({}).populate('author', 'username email').sort({ createdAt: -1 }));
    }
    res.json(storage.posts.map((post) => ({
        ...post,
        author: storage.users.find((user) => user.id === post.author)?.username || 'Unknown',
    })));
});

router.patch('/users/:id/role', async (req, res) => {
    const role = req.body.role === 'admin' ? 'admin' : 'user';
    if (isDbConnected()) {
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('username email role');
        return user ? res.json(user) : res.status(404).json({ message: 'User not found.' });
    }
    const user = storage.users.find((item) => item.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.role = role;
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

router.delete('/posts/:id', async (req, res) => {
    if (isDbConnected()) {
        const post = await Post.findByIdAndDelete(req.params.id);
        return post ? res.json({ message: 'Post deleted.' }) : res.status(404).json({ message: 'Post not found.' });
    }
    const index = storage.posts.findIndex((post) => post.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Post not found.' });
    storage.posts.splice(index, 1);
    res.json({ message: 'Post deleted.' });
});

module.exports = router;
