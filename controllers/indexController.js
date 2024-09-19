const asyncHandler = require('express-async-handler');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const prisma = require('../prisma/client');

//  localhost:000/user
exports.form_signup_get = asyncHandler(async (req, res, next) => {
  const hashedPassword = await bcrypt.hash('password', 10);

  await prisma.user.create({
    data: {
      username: 'first',
      hashpwd: hashedPassword,
    },
  });

  res.send('created user with password');
});

exports.form_signup_post = [

  body('username')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Username must be specified'),
  body('password')
    .trim()
    .isLength({ min: 6 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const { username } = req;
      const { password } = req;

      const hashpwd = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          username,
          hashpwd,
        },
      });

      // check for pre-existing user

      res.send('created user with password');
      res.status(200).json();
    } else {
      console.log(errors);
    }
  }),
];

exports.form_login_post = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('validation errors');
      const err = new Error('validation failed');
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }
    passport.authenticate('local', (err, user, info) => {
      console.log('user', user);
      if (err) { return next(err); }
      if (!user) { return res.redirect('/fail'); }
      if (user) {
        const payloadObj = {
          id: user.id,
          name: user.username,
        };
        const token = jwt.sign(payloadObj, 'secret', { algorithm: 'HS256' });
        return res.json({ token });
      }
    })(req, res, next);
  } catch (error) {
    console.log('catch node err');
    const status = error.statusCode;
    res.status(status).json({ error: error.data });
  }
};
