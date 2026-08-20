const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    platform: { type: String, trim: true },
    mediaUrl: { type: String, trim: true },
    tags: { type: [String], default: [] },
    scheduledAt: { type: Date },
    status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Post', postSchema);
