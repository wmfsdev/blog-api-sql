const express = require('express');

const router = express.Router();

const indexController = require('../controllers/indexController');

router.get('/sign-up', indexController.signup_post);

module.exports = router;
