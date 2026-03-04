const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const User = require('../models/User');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find()
      .populate('author', 'username name')
      .populate('category', 'name')
      .sort({ creationDate: -1 });
    res.render('index', { entries, title: 'Blog Home' });
  } catch (err) {
    res.status(500).send('Error loading entries: ' + err.message);
  }
});

router.get('/entry/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id)
      .populate('author', 'username name')
      .populate('category', 'name');
    
    if (!entry) {
      return res.status(404).send('Entry not found');
    }
    
    entry.impressionCount += 1;
    await entry.save();
    
    const comments = await Comment.find({ entry: entry._id }).sort({ creationDate: -1 });
    
    res.render('entry', { entry, comments, title: entry.title });
  } catch (err) {
    res.status(500).send('Error loading entry: ' + err.message);
  }
});

router.get('/new-entry', async (req, res) => {
  try {
    const categories = await Category.find();
    const users = await User.find();
    res.render('new-entry', { categories, users, title: 'New Entry' });
  } catch (err) {
    res.status(500).send('Error loading form: ' + err.message);
  }
});

router.post('/entry', async (req, res) => {
  try {
    const { title, author, category, description, content, commentsAllowed } = req.body;
    
    const contentArray = [];
    if (content && Array.isArray(content)) {
      content.forEach((item, index) => {
        const type = req.body[`content[${index}][type]`];
        const value = req.body[`content[${index}][value]`];
        const desc = req.body[`content[${index}][description]`];
        if (type && value) {
          contentArray.push({ type, value, description: desc || '' });
        }
      });
    }
    
    const entry = new Entry({
      title,
      author,
      category: category || null,
      description,
      content: contentArray,
      commentsAllowed: commentsAllowed === 'on',
      creationDate: new Date(),
      editDates: [],
      impressionCount: 0
    });
    
    await entry.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error creating entry: ' + err.message);
  }
});

module.exports = router;
