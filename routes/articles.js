const express = require('express');

const router = express.Router();

const articleController = require('../controllers/articleController');

router.get('/create', articleController.article_post);

module.exports = router;
