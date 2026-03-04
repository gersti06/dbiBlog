const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes');

const app = express();
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    await createIndexes();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    const User = require('./models/User');
    const Entry = require('./models/Entry');
    
    await User.createIndex({ username: 1 }, { unique: true });
    console.log('Created unique index on username');
    
    await Entry.createIndex({ title: 1, author: 1 }, { unique: true });
    console.log('Created unique compound index on title + author');
  } catch (err) {
    console.log('Indexes may already exist:', err.message);
  }
}

app.use(routes);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
