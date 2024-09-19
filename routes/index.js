const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

require('../config/passport');

const indexController = require('../controllers/indexController');

// router.get('/signup-form', indexController.form_signup_get);

router.post('/signup-form', indexController.form_signup_post);

router.post('/login-form', [
  body('username')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Username must be specified'),
  body('password')
    .trim()
    .isLength({ min: 6 }),
], indexController.form_login_post);

module.exports = router;
