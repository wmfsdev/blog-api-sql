const asyncHandler = require('express-async-handler');
const passport = require('passport');
const prisma = require('../prisma/client');

// GET article by ID
exports.article_get = asyncHandler(async (req, res, next) => {
  console.log('req.params', req.params);
  // these are jsut comments
  // but we need the article as well!
  const article = await prisma.article.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  //  console.log(article);
  return res.json(article);
});

// GET all comments for article
exports.article_comments_get = asyncHandler(async (req, res, next) => {
  console.log('all comments param id', req.params.id);
  const comments = await prisma.comment.findMany({
    where: {
      articleId: Number(req.params.id),
    },
    include: {
      author: {
        select: {
          username: true,
        },
      },
    },
  });
  console.log(comments);
  return res.json(comments);
});

// GET all articles
exports.articles_get = asyncHandler(async (req, res, next) => {
  const articles = await prisma.article.findMany({});
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
    // check against user details that user has permission to post as said user
    // should be fine: user can only contain the ID of a non-malformed token i.e.
    // the one you should be authenticating with. can't change the ID before, it
    // will fail auth.

    const userId = user.id;
    const articleId = Number(req.params.id);

    const { comment } = req.body;

    await prisma.comment.create({
      data: {
        body: comment,
        authorId: userId,
        articleId,
      },
    });

    return res.status(200).json(info);
  })(req, res, next);
});

exports.user_comment_delete = asyncHandler(async (req, res, next) => {
  console.log('user comment delete');

  passport.authenticate('jwt', async (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'not authorised' });
    }

    const commentId = Number(req.body.comment);
    // const articleId = req.body.article;

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json(info);
  })(req, res, next);
});
