const asyncHandler = require('express-async-handler');
const passport = require('passport');

const bcrypt = require('bcryptjs');

const prisma = require('../prisma/client');

exports.signup_post = asyncHandler(async (req, res, next) => {
  const hashedPassword = await bcrypt.hash('password', 10);

  await prisma.user.create({
    data: {
      username: 'first',
      hashpwd: hashedPassword,
    },
  });

  res.send('created user with password');
});
