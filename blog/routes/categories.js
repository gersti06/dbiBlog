const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/new-category', (req, res) => {
  res.render('new-category', { title: 'New Category', error: null });
});

router.post('/new-category', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.render('new-category', { title: 'New Category', error: 'Category already exists' });
    }
    
    const newCategory = new Category({
      name,
      description
    });
    
    await newCategory.save();
    res.redirect('/');
  } catch (err) {
    res.render('new-category', { title: 'New Category', error: 'Error creating category: ' + err.message });
  }
});

module.exports = router;
