const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const User = require('./models/User');
const Entry = require('./models/Entry');
const Category = require('./models/Category');
const Comment = require('./models/Comment');

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
    await User.createIndex({ username: 1 }, { unique: true });
    console.log('Created unique index on username');
    
    await Entry.createIndex({ title: 1, author: 1 }, { unique: true });
    console.log('Created unique compound index on title + author');
  } catch (err) {
    console.log('Indexes may already exist:', err.message);
  }
}

app.get('/', async (req, res) => {
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

app.get('/entry/:id', async (req, res) => {
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

app.get('/new-entry', async (req, res) => {
  try {
    const categories = await Category.find();
    const users = await User.find();
    res.render('new-entry', { categories, users, title: 'New Entry' });
  } catch (err) {
    res.status(500).send('Error loading form: ' + err.message);
  }
});

app.get('/new-author', (req, res) => {
  res.render('new-author', { title: 'New Author', error: null });
});

app.post('/new-author', async (req, res) => {
  try {
    const { username, firstname, lastname, email, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('new-author', { title: 'New Author', error: 'Username already exists' });
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

app.get('/new-category', (req, res) => {
  res.render('new-category', { title: 'New Category', error: null });
});

app.post('/new-category', async (req, res) => {
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

app.post('/entry', async (req, res) => {
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

app.post('/entry/:id/comment', async (req, res) => {
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

app.get('/queries', (req, res) => {
  res.render('queries', { title: 'Query Results', results: null, query: '' });
});

app.post('/queries', async (req, res) => {
  try {
    const queryType = req.body.queryType;
    let result;
    let query = '';
    
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
    }
    
    res.render('queries', { 
      title: 'Query Results', 
      results: result, 
      query: query + (result ? ` (${Array.isArray(result) ? result.length : 1} results)` : '')
    });
  } catch (err) {
    res.status(500).send('Query error: ' + err.message);
  }
});

app.get('/changes', async (req, res) => {
  try {
    const entries = await Entry.find().select('title');
    const users = await User.find().select('username name');
    const categories = await Category.find().select('name');
    res.render('changes', { title: 'Data Changes', message: null, entries, users, categories });
  } catch (err) {
    res.render('changes', { title: 'Data Changes', message: 'Error: ' + err.message, entries: [], users: [], categories: [] });
  }
});

app.post('/changes', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
