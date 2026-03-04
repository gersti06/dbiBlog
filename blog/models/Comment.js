const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  author: {
    username: { type: String, required: true },
    email: { type: String }
  },
  content: { type: String, required: true },
  creationDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
