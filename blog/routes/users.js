const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/new-author', (req, res) => {
  res.render('new-author', { title: 'New Author', error: null });
});

router.post('/new-author', async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('new-author', { title: 'New Author', error: 'Username already exists' });
    }
    
    if (!username || username.trim() === '') {
      return res.render('new-author', { title: 'New Author', error: 'Username is required' });
    }
    
    if (!password || password.length < 4) {
      return res.render('new-author', { title: 'New Author', error: 'Password must be at least 4 characters' });
    }
    
    const newUser = new User({
      username,
      name: { firstname, lastname },
      email,
      password
    });
    
    await newUser.save();
    res.redirect('/');
  } catch (err) {
    res.render('new-author', { title: 'New Author', error: 'Error creating author: ' + err.message });
  }
});

module.exports = router;
