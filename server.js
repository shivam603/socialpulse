const path = require('path');
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const storage = require('./data/storage');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'app.html')));

const seedAdmin = async () => {
    const email = (process.env.ADMIN_EMAIL || 'admin@contentdeck.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const existing = mongoose.connection.readyState === 1
        ? await User.findOne({ email })
        : storage.users.find((user) => user.email === email);
    if (existing) return;
    const user = { username: 'Administrator', email, password: await bcrypt.hash(password, 10), role: 'admin' };
    if (mongoose.connection.readyState === 1) await User.create(user);
    else storage.createUser(user);
};

const initialize = async () => {
    if (process.env.MONGO_URI) {
        try { await mongoose.connect(process.env.MONGO_URI); } catch (error) { console.warn('MongoDB unavailable; using in-memory storage.'); }
    }
    await seedAdmin();
};

const start = async () => {
    await initialize();
    app.listen(port, '0.0.0.0', () => console.log(`Content Deck running at http://localhost:${port}`));
};

if (require.main === module) start();
module.exports = { app, initialize, start };
