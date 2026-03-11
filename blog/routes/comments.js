const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const Comment = require('../models/Comment');

router.post('/entry/:id/comment', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).render('error', { title: '400 - Invalid ID', message: 'The provided ID is not a valid format' });
    }
    
    const entry = await Entry.findById(req.params.id);
    if (!entry || !entry.commentsAllowed) {
      return res.status(400).send('Comments not allowed on this entry');
    }
    
    const comment = new Comment({
      entry: entry._id,
      author: {
        username: req.body.username || 'Anonymous',
        email: req.body.email || ''
      },
      content: req.body.content
    });
    
    await comment.save();
    res.redirect(`/entry/${entry._id}`);
  } catch (err) {
    res.status(500).send('Error adding comment: ' + err.message);
  }
});

module.exports = router;
