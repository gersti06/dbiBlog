const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

function getImageBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (e) {
    return null;
  }
}

async function seed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Entry.deleteMany({});
  await Category.deleteMany({});
  await Comment.deleteMany({});
  console.log('Cleared existing data');

  const users = await User.insertMany([
    { username: 'admin', name: { firstname: 'Admin', lastname: 'User' }, email: 'admin@blog.com', password: 'admin123' },
    { username: 'johndoe', name: { firstname: 'John', lastname: 'Doe' }, email: 'john@blog.com', password: 'password123' },
    { username: 'janesmith', name: { firstname: 'Jane', lastname: 'Smith' }, email: 'jane@blog.com', password: 'password123' },
    { username: 'guest', name: { firstname: 'Guest', lastname: 'Visitor' }, email: 'guest@blog.com', password: 'guest123' },
    { username: 'writerpro', name: { firstname: 'Pro', lastname: 'Writer' }, email: 'pro@blog.com', password: 'writer123' }
  ]);
  console.log('Created 5 users');

  const categories = await Category.insertMany([
    { name: 'Technology', description: 'Tech related articles' },
    { name: 'Travel', description: 'Travel experiences and tips' },
    { name: 'Food', description: 'Food reviews and recipes' }
  ]);
  console.log('Created 3 categories');

  const sampleImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const entries = await Entry.insertMany([
    {
      title: 'Getting Started with MongoDB',
      author: users[0]._id,
      category: categories[0]._id,
      description: 'An introduction to MongoDB for beginners',
      creationDate: new Date('2026-02-20'),
      editDates: [new Date('2026-02-21')],
      impressionCount: 150,
      content: [
        { type: 'text', value: 'MongoDB is a popular NoSQL database that uses JSON-like documents.' },
        { type: 'link', value: 'https://www.mongodb.com', description: 'Official MongoDB website' },
        { type: 'text', value: 'This tutorial will help you get started with MongoDB basics.' }
      ],
      commentsAllowed: true,
      hashtags: ['mongodb', 'database', 'nosql']
    },
    {
      title: 'My Trip to Paris',
      author: users[1]._id,
      category: categories[1]._id,
      description: 'A wonderful travel experience',
      creationDate: new Date('2026-02-15'),
      editDates: [],
      impressionCount: 89,
      content: [
        { type: 'text', value: 'Paris is known as the City of Light and love.' },
        { type: 'image', value: sampleImage, description: 'Eiffel Tower' },
        { type: 'text', value: 'The food was amazing, especially the croissants!' }
      ],
      commentsAllowed: true,
      hashtags: ['paris', 'travel', 'france']
    },
    {
      title: 'Best Pizza Recipes',
      author: users[2]._id,
      category: categories[2]._id,
      description: 'Homemade pizza recipes',
      creationDate: new Date('2026-02-18'),
      editDates: [new Date('2026-02-19'), new Date('2026-02-22')],
      impressionCount: 200,
      content: [
        { type: 'text', value: 'Making pizza at home is fun and delicious.' },
        { type: 'image', value: sampleImage, description: 'Pizza image' },
        { type: 'link', value: 'https://www.example.com/pizza-recipe', description: 'Detailed recipe' },
        { type: 'image', value: sampleImage, description: 'Another pizza image' }
      ],
      commentsAllowed: true,
      hashtags: ['pizza', 'recipe', 'food']
    },
    {
      title: 'JavaScript Tips and Tricks',
      author: users[0]._id,
      category: categories[0]._id,
      description: 'Useful JavaScript tips for developers',
      creationDate: new Date('2026-02-22'),
      editDates: [],
      impressionCount: 75,
      content: [
        { type: 'text', value: 'JavaScript is a versatile programming language.' },
        { type: 'link', value: 'https://developer.mozilla.org', description: 'MDN Web Docs' }
      ],
      commentsAllowed: false,
      hashtags: ['javascript', 'programming']
    },
    {
      title: 'Weekend in Vienna',
      author: users[4]._id,
      category: categories[1]._id,
      description: 'Exploring Vienna during the weekend',
      creationDate: new Date('2026-02-10'),
      editDates: [new Date('2026-02-12')],
      impressionCount: 120,
      content: [
        { type: 'text', value: 'Vienna is the capital of Austria and has beautiful architecture.' },
        { type: 'image', value: sampleImage, description: 'Vienna skyline' },
        { type: 'image', value: sampleImage, description: 'St. Stephen Cathedral' },
        { type: 'image', value: sampleImage, description: 'Schönbrunn Palace' }
      ],
      commentsAllowed: true,
      hashtags: ['vienna', 'austria', 'weekend']
    },
    {
      title: 'Simple Pasta Recipe',
      author: users[2]._id,
      category: categories[2]._id,
      description: 'A quick and easy pasta recipe',
      creationDate: new Date('2026-02-23'),
      editDates: [],
      impressionCount: 45,
      content: [
        { type: 'text', value: 'This pasta recipe takes only 20 minutes to prepare.' },
        { type: 'link', value: 'https://www.example.com/pasta', description: 'More details' }
      ],
      commentsAllowed: true,
      hashtags: ['pasta', 'recipe', 'italian']
    }
  ]);
  console.log('Created 6 entries');

  const comments = await Comment.insertMany([
    {
      entry: entries[0]._id,
      author: { username: 'johndoe', email: 'john@blog.com' },
      content: 'Great introduction! Very helpful for beginners.',
      creationDate: new Date('2026-02-21')
    },
    {
      entry: entries[0]._id,
      author: { username: 'guest', email: 'guest@blog.com' },
      content: 'Thanks for sharing this information.',
      creationDate: new Date('2026-02-22')
    },
    {
      entry: entries[1]._id,
      author: { username: 'janesmith', email: 'jane@blog.com' },
      content: 'I want to visit Paris too!',
      creationDate: new Date('2026-02-16')
    },
    {
      entry: entries[2]._id,
      author: { username: 'writerpro', email: 'pro@blog.com' },
      content: 'These recipes look delicious!',
      creationDate: new Date('2026-02-20')
    }
  ]);
  console.log('Created 4 comments');

  console.log('\n=== Database seeding complete! ===');
  console.log(`Users: ${users.length}`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Entries: ${entries.length}`);
  console.log(`Comments: ${comments.length}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seed().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
