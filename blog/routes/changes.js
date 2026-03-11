const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const User = require('../models/User');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

router.get('/changes', async (req, res) => {
  try {
    const entries = await Entry.find().select('title');
    const users = await User.find().select('username name');
    const categories = await Category.find().select('name');
    res.render('changes', { title: 'Data Changes', message: null, entries, users, categories });
  } catch (err) {
    res.render('changes', { title: 'Data Changes', message: 'Error: ' + err.message, entries: [], users: [], categories: [] });
  }
});

router.post('/changes', async (req, res) => {
  try {
    const changeType = req.body.changeType;
    let message = '';
    
    switch (changeType) {
      case 'add-author':
        if (!mongoose.Types.ObjectId.isValid(req.body.entryId)) {
          return res.render('changes', { title: 'Data Changes', message: 'Invalid Entry ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(req.body.newAuthor)) {
          return res.render('changes', { title: 'Data Changes', message: 'Invalid Author ID' });
        }
        await Entry.findByIdAndUpdate(req.body.entryId, {
          $set: { author: req.body.newAuthor }
        });
        message = 'Author updated successfully';
        break;
        
      case 'add-hashtag':
        const newestEntry = await Entry.findOne().sort({ creationDate: -1 });
        if (newestEntry) {
          if (!newestEntry.hashtags) newestEntry.hashtags = [];
          newestEntry.hashtags.push(req.body.hashtag);
          await newestEntry.save();
          message = `Added hashtag to newest entry: ${newestEntry.title}`;
        }
        break;
        
      case 'rename-category':
        if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
          return res.render('changes', { title: 'Data Changes', message: 'Invalid Category ID', entries: [], users: [], categories: [] });
        }
        await Category.findByIdAndUpdate(req.body.categoryId, {
          $set: { name: req.body.newName }
        });
        message = 'Category renamed successfully';
        break;
        
      case 'upsert-entry':
        if (req.body.upsertAuthor && !mongoose.Types.ObjectId.isValid(req.body.upsertAuthor)) {
          return res.render('changes', { title: 'Data Changes', message: 'Invalid Author ID' });
        }
        const existingEntry = await Entry.findOne({ title: req.body.upsertTitle });
        if (existingEntry) {
          await Entry.findByIdAndUpdate(existingEntry._id, {
            $set: { description: req.body.upsertDescription }
          });
          message = 'Existing entry updated';
        } else {
          const newEntry = new Entry({
            title: req.body.upsertTitle,
            author: req.body.upsertAuthor,
            description: req.body.upsertDescription,
            content: [],
            commentsAllowed: true,
            impressionCount: 0
          });
          await newEntry.save();
          message = 'New entry created';
        }
        break;
        
      case 'delete-entry':
        if (!mongoose.Types.ObjectId.isValid(req.body.deleteEntryId)) {
          return res.render('changes', { title: 'Data Changes', message: 'Invalid Entry ID' });
        }
        const entryToDelete = await Entry.findById(req.body.deleteEntryId);
        if (entryToDelete) {
          await Comment.deleteMany({ entry: entryToDelete._id });
          await Entry.findByIdAndDelete(req.body.deleteEntryId);
          message = 'Entry and its comments deleted';
        }
        break;
    }
    
    res.render('changes', { title: 'Data Changes', message });
  } catch (err) {
    res.render('changes', { title: 'Data Changes', message: 'Error: ' + err.message });
  }
});

module.exports = router;
