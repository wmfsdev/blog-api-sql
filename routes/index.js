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
    .notEmpty().withMessage('Username is required')
    .trim()
    .isLength({ min: 5, max: 18 })
    .withMessage('Username must be between 5 and 18 characters')
    .isAlphanumeric()
    .withMessage('May only contain alphanumeric characters'),
  body('password')
    .trim()
    .isLength({ min: 6, max: 25 })
    .withMessage('Must be between 6 and 25 characters'),
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
    .notEmpty().withMessage('Looks like you forgot to write your comment!')
    .isLength({ min: 1, max: 500 })
    .withMessage('Cannot exceed 500 characters'),
], articleController.user_comment_post);

// POST Article
router.post('/articles', articleController.article_post);

// DELETE User comment
router.delete('/articles/:id/comments/:id', articleController.user_comment_delete);

// check to make sure that the controller only works for the correct USER, not any random user

// UPDATE Article
router.put('/articles/:id', articleController.article_update);

module.exports = router;
