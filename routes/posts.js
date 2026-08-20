const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const storage = require('../data/storage');

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', auth, async (req, res) => {
    try {
        if (isDbConnected()) {
            const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
            return res.json(posts);
        }

        const posts = storage.posts
            .filter((post) => post.author === req.user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(posts);
    } catch (error) {
        console.error('Fetch posts error:', error);
        res.status(500).json({ message: 'Failed to fetch posts.' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { title, content, platform, mediaUrl, tags, scheduledAt } = req.body;
        if (!title || !content || !platform) {
            return res.status(400).json({ message: 'Title, content, and platform are required.' });
        }
        const status = scheduledAt ? 'scheduled' : 'draft';
        if (isDbConnected()) {
            const post = await Post.create({
                title,
                content,
                platform,
                mediaUrl,
                tags: Array.isArray(tags) ? tags : [],
                scheduledAt,
                status,
                author: req.user.id,
            });
            return res.status(201).json(post);
        }

        const post = storage.createPost({
            title,
            content,
            platform,
            mediaUrl,
            tags: Array.isArray(tags) ? tags : [],
            scheduledAt,
            status,
            author: req.user.id,
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Failed to create post.' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        if (isDbConnected()) {
            const post = await Post.findOne({ _id: req.params.id, author: req.user.id });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }
            return res.json(post);
        }

        const post = storage.posts.find((item) => item.id === req.params.id && item.author === req.user.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(post);
    } catch (error) {
        console.error('Fetch post error:', error);
        res.status(500).json({ message: 'Failed to fetch post.' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const updates = { ...req.body };
        if (Object.prototype.hasOwnProperty.call(updates, 'scheduledAt')) {
            updates.status = updates.scheduledAt ? 'scheduled' : 'draft';
        }
        if (isDbConnected()) {
            const post = await Post.findOneAndUpdate(
                { _id: req.params.id, author: req.user.id },
                updates,
                { new: true, runValidators: true }
            );
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }
            return res.json(post);
        }

        const post = storage.updatePost(req.params.id, req.user.id, updates);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(post);
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ message: 'Failed to update post.' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        if (isDbConnected()) {
            const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }
            return res.json({ message: 'Post deleted.' });
        }

        const deleted = storage.deletePost(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json({ message: 'Post deleted.' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Failed to delete post.' });
    }
});

module.exports = router;
