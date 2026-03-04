const mongoose = require('mongoose');

const contentItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'link', 'image', 'video'], required: true },
  value: { type: String, required: true },
  description: { type: String }
}, { _id: false });

const entrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogUser',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  description: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  editDates: [{ type: Date }],
  impressionCount: { type: Number, default: 0 },
  content: [contentItemSchema],
  commentsAllowed: { type: Boolean, default: true },
  hashtags: [{ type: String }]
}, { timestamps: true });

entrySchema.index({ title: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Entry', entrySchema);
