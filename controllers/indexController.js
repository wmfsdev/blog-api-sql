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
    .isLength({ min: 2 }),
  body('confirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords must match'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const { username } = req.body;
      const { password } = req.body;

      const hashpwd = await bcrypt.hash(password, 10);

      try {
        const user = await prisma.user.create({
          data: {
            username,
            hashpwd,
          },
        });
        const payloadObj = {
          id: user.id,
          username: user.username,
        };
        const token = jwt.sign(payloadObj, 'secret', { algorithm: 'HS256' });
        res.status(200).json({ token });
      } catch (err) {
        console.log('catch err', err);
      }
    } else {
      // validation error handling
      console.log('errorsds', errors);
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
      if (!user) {
        console.log('no user');
        return res.status(401).json(info);
      }
      if (user) {
        const payloadObj = {
          id: user.id,
          username: user.username,
        };
        const token = jwt.sign(payloadObj, 'secret', { algorithm: 'HS256' });
        return res.json({ token });
      }
    })(req, res, next);
  } catch (error) {
    console.log('catch node err');
    const status = error.statusCode;
    // sends array of errors to client
    res.status(status).json(error.data);
  }
};
