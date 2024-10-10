const express = require('express');

const router = express.Router();

const articleController = require('../controllers/articleController');

// router.get('/', articleController.article_get);

router.get('/create', articleController.article_post);

// it's the address that shouldn't contain descriptions i.e. GET/POST
// but it is fine to include those "descriptions" in function names like
// article_get

module.exports = router;
