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
router.get('/articles', articleController.article_get);

// PROTECTED ROUTES

// GET all comments for specific article
router.get('/articles/:id/comments', articleController.user_comment_post);

// POST Article
router.get('/test', articleController.article_post);

module.exports = router;
