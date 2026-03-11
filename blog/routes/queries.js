const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Comment = require('../models/Comment');

router.get('/queries', (req, res) => {
  res.render('queries', { title: 'Query Results', results: null, query: '', error: null });
});

router.post('/queries', async (req, res) => {
  try {
    const queryType = req.body.queryType;
    let result;
    let query = '';
    let error = null;
    
    if (!queryType) {
      return res.render('queries', { title: 'Query Results', results: null, query: 'Please select a query type', error: 'No query type selected' });
    }
    
    switch (queryType) {
      case 'user-login':
        result = await User.findOne({ 
          username: req.body.username, 
          password: req.body.password 
        });
        query = 'User login check';
        break;
        
      case 'entries-by-user':
        const user = await User.findOne({ username: req.body.searchUsername });
        if (user) {
          result = await Entry.find({ author: user._id })
            .populate('author', 'username name');
        } else {
          result = [];
        }
        query = 'Entries by user';
        break;
        
      case 'entries-no-additional':
        result = await Entry.find({ 
          $or: [
            { content: { $exists: true, $size: 0 } },
            { hashtags: { $exists: false } },
            { hashtags: null },
            { hashtags: { $exists: true, $size: 0 } }
          ]
        }).populate('author', 'username');
        query = 'Entries without additional fields';
        break;
        
      case 'entries-more-than-1-image':
        result = await Entry.find({
          $expr: { $gt: [{ $size: { $filter: { input: "$content", cond: { $eq: ["$$this.type", "image"] } } } }, 1] }
        }).populate('author', 'username');
        query = 'Entries with more than 1 image';
        break;
        
      case 'entries-with-images':
        result = await Entry.find({
          content: { $elemMatch: { type: "image" } }
        }).populate('author', 'username');
        query = 'Entries with images';
        break;
        
      case 'entries-author-lastname':
        const lastnameUser = await User.findOne({ "name.lastname": req.body.lastname });
        const adminUser = await User.findOne({ username: "admin" });
        const guestUser = await User.findOne({ username: "guest" });
        
        const authorFilter = { $nin: [] };
        if (guestUser) authorFilter.$nin.push(guestUser._id);
        
        const orConditions = [];
        if (lastnameUser) orConditions.push({ author: lastnameUser._id });
        if (adminUser) orConditions.push({ author: adminUser._id });
        
        if (orConditions.length > 0) {
          result = await Entry.find({
            $or: orConditions,
            author: { $nin: authorFilter.$nin }
          }).populate('author', 'username name');
        } else {
          result = [];
        }
        query = 'Entries by author lastname or admin, not guest';
        break;
        
      case 'title-in-content':
        result = await Entry.find({
          $expr: {
            $anyElementTrue: {
              $map: {
                input: "$content",
                as: "c",
                in: { $regexMatch: { input: "$$c.value", regex: new RegExp(req.body.titleSearch, "i") } }
              }
            }
          }
        }).populate('author', 'username');
        query = 'Title mentioned in content';
        break;
        
      case 'users-sorted':
        result = await User.find().sort({ username: 1 });
        query = 'Users sorted ascending';
        break;
        
      case 'newest-2-entries':
        result = await Entry.find().sort({ creationDate: -1 }).limit(2).populate('author', 'username');
        query = 'Newest 2 entries';
        break;
        
      case 'second-oldest-entry':
        result = await Entry.find().sort({ creationDate: 1 }).skip(1).limit(1).populate('author', 'username');
        query = 'Second oldest entry';
        break;
        
      case 'entries-last-week-with-link':
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        result = await Entry.find({
          creationDate: { $gte: lastWeek },
          content: { $elemMatch: { type: "link" } }
        }).populate('author', 'username');
        query = 'Entries last week with links';
        break;
        
      case 'newest-comments-for-user':
        const userEntries = await Entry.find({ "author.username": req.body.commentUser });
        const entryIds = userEntries.map(e => e._id);
        result = await Comment.find({ entry: { $in: entryIds } })
          .sort({ creationDate: -1 })
          .limit(2);
        query = 'Newest 2 comments for user entries';
        break;
        
      default:
        result = [];
        error = 'Unknown query type';
    }
    
    res.render('queries', { 
      title: 'Query Results', 
      results: result, 
      query: query + (result ? ` (${Array.isArray(result) ? result.length : 1} results)` : ''),
      error: null
    });
  } catch (err) {
    console.error('Query error:', err);
    res.render('queries', { 
      title: 'Query Results', 
      results: null, 
      query: 'Query failed',
      error: 'An error occurred while executing the query. Please try again.'
    });
  }
});

module.exports = router;
