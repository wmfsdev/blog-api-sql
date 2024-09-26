const asyncHandler = require('express-async-handler');
const passport = require('passport');
const prisma = require('../prisma/client');

// GET all articles
exports.article_get = asyncHandler(async (req, res, next) => {
  const articles = await prisma.article.findMany({
    include: {
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });
  console.log(articles);
  return res.json(articles);
});

// POST Article
exports.article_post = asyncHandler(async (req, res, next) => {
  await prisma.article.create({
    data: {
      title: 'second post',
      body: 'body of the second post',
      category: 'social',
      authorId: 1,
    },
  });
});

exports.user_comment_post = asyncHandler(async (req, res, next) => {
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'not authorised' });
    }

    console.log('auth user ', user);

    const userId = user.id;
    const articleId = Number(req.params.id);

    // await prisma.comment.create({
    //   data: {
    //     body: 'new sql comment',
    //     authorId: userId,
    //     articleId,
    //   },
    // });

    // for testing ^^creation
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      include: {
        comments: true,
      },
    });
    console.log('user include comments', users[0].comments);

    return res.status(200).json(info);
  })(req, res, next);

  // extract payload from token for user ID

  // article ID
  // const articleId = req.params.id;

  // console.log(articleId);
});
