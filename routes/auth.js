const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const storage = require('../data/storage');

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateToken = (user) => {
    const payload = { id: user._id || user.id, email: user.email, username: user.username, role: user.role || 'user' };
    return jwt.sign(payload, process.env.JWT_SECRET || 'default_jwt_secret', {
        expiresIn: '7d',
    });
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        const existingUser = isDbConnected()
            ? await User.findOne({ email })
            : storage.users.find((item) => item.email === email);

        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = isDbConnected()
            ? await User.create({ username, email, password: hashedPassword })
            : storage.createUser({ username, email, password: hashedPassword, role: 'user' });

        const token = generateToken(user);
        res.status(201).json({ token, user: { id: user._id || user.id, username: user.username, email: user.email, role: user.role || 'user' } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Failed to register user.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = isDbConnected()
            ? await User.findOne({ email })
            : storage.users.find((item) => item.email === email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user._id || user.id, username: user.username, email: user.email, role: user.role || 'user' } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Failed to log in.' });
    }
});

module.exports = router;
