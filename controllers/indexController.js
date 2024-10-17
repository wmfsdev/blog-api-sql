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
        const token = jwt.sign(payloadObj, process.env.SECRET, { algorithm: 'HS256' });
        res.status(200).json({ token });
      } catch (err) {
        // Prisma error i.e. unique constraint on username
        console.log('catch err', err);
        if (err.code === 'P2002') {
          return res.status(422).json([{ msg: 'Username already taken' }]);
        }
        // const err{
        //   "error": "Bad request",
        //   "message": "Request body could not be read properly.",
        // }
      }
    } else {
      // validation error handling
      const err = new Error('validation failed');
      err.statusCode = 422;
      err.data = errors.array();
      res.status(err.statusCode).json(err.data);
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
        console.log(info);
        return res.status(401).json([info]);
      }

      // if login from CMS and user NOT admin return not authorised
      if (req.hostname === process.env.CMS_URL && user.role === 'USER') {
        console.log('403 USER');
        return res.status(401).json([{ message: 'forbiddenn' }]);
      }

      // if login from CMS and user IS admin sign and return token
      // if (req.hostname === process.env.CMS_URL && user.role === "ADMIN") {
      //   const payloadObj = {
      //     id: user.id,
      //     username: user.username,
      //     role: user.role
      //   };
      //   const token = jwt.sign(payloadObj, process.env.SECRET, { algorithm: 'HS256' });
      //   return res.json({ token });
      // }

      // if login from ANYWHERE ELSE carry on as usual (user role not relevant)
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
    // sends array of errors to client
    console.log('catch node err');
    const status = error.statusCode;
    console.log(error.data);
    res.status(status).json(error.data);
  }
};
