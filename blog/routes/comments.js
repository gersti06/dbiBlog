const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const Comment = require('../models/Comment');

router.post('/entry/:id/comment', async (req, res) => {
  try {
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
