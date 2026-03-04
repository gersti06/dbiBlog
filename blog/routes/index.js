const express = require('express');
const router = express.Router();

const entriesRouter = require('./entries');
const usersRouter = require('./users');
const categoriesRouter = require('./categories');
const commentsRouter = require('./comments');
const queriesRouter = require('./queries');
const changesRouter = require('./changes');

router.use(entriesRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(commentsRouter);
router.use(queriesRouter);
router.use(changesRouter);

module.exports = router;
