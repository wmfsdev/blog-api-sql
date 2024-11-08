const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

require('../config/passport');

const indexController = require('../controllers/indexController');
const articleController = require('../controllers/articleController');

// POST Signup Form
router.post('/signup-form', indexController.form_signup_post);

// POST Login Form
router.post('/login-form', [
  body('username')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Username too short'),
  body('password')
    .trim(),
  // .isLength({ min: 6 }),
], indexController.form_login_post);

// GET all Articles
router.get('/articles', articleController.articles_get);

// GET Article
router.get('/articles/:id', articleController.article_get);

// GET all comments for specific article
router.get('/articles/:id/comments', articleController.article_comments_get);

// PROTECTED ROUTES

router.delete('/articles/:id', articleController.article_delete);

// POST User comment
router.post('/articles/:id/comments', [
  body('comment')
    .isLength({ min: 5 })
    .withMessage('Please enter a comment'),
], articleController.user_comment_post);

// POST Article
router.post('/articles', articleController.article_post);

// DELETE User comment
router.delete('/articles/:id/comments/:id', articleController.user_comment_delete);

// UPDATE Article
router.put('/articles/:id', articleController.article_update);

module.exports = router;
