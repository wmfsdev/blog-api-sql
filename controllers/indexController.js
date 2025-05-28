const asyncHandler = require('express-async-handler');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const prisma = require('../prisma/client');

exports.form_signup_post = [

  body('username')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Username must be 5 or more characters long'),
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
          role: user.role,
        };

        const token = jwt.sign(payloadObj, process.env.SECRET, { algorithm: 'HS256', expiresIn: '1800000' });
        res.status(200).json({ token });
      } catch (err) {
        if (err.code === 'P2002') {
          return res.status(422).json([{ msg: 'Username already taken' }]);
        }
      }
    } else {
      const err = new Error('validation failed');
      err.statusCode = 422;
      err.data = errors.array();
      res.status(err.statusCode).json(err.data);
    }
  }),
];

exports.form_login_post = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('validation failed');
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        return res.status(401).json([info]);
      }

      if (req.headers.origin === process.env.CMS_URL && user.role === 'USER') {
        return res.status(401).json([{ message: 'forbidden' }]);
      }

      if (user) {
        const payloadObj = {
          id: user.id,
          username: user.username,
          role: user.role,
        };
        const token = jwt.sign(payloadObj, process.env.SECRET, { algorithm: 'HS256' });
        return res.json({ token });
      }
    })(req, res, next);
  } catch (error) {
    const status = error.statusCode;
    res.status(status).json(error.data);
  }
};
