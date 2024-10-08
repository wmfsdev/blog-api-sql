const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
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
  // await prisma.article.create({
  //   data: {
  //     title: 'second post',
  //     body: 'body of the second post',
  //     category: 'social',
  //     authorId: 1,
  //   },
  // });
});

exports.user_comment_post = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('validation errors');
      const err = new Error('validation failed');
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }
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
  } catch (error) {
    // err throw - sends array of errors to client
    console.log('catch node err');
    const status = error.statusCode;
    console.log(error.data);
    res.status(status).json(error.data);
  }
};

exports.user_comment_delete = asyncHandler(async (req, res, next) => {
  console.log('user comment delete');

  passport.authenticate('jwt', async (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'not authorised' });
    }
    // include user id as hidden input to compare - frontend solution
    const userId = Number(user.id); // from token
    // check that User has permission to delete the specific comment!
    // look at payload of the token and compare User IDs
    const commentId = Number(req.body.comment);

    const deletionResult = await prisma.comment.deleteMany({
      where: {
        AND: [
          {
            id: {
              equals: commentId,
            },
          },
          {
            authorId: {
              equals: userId,
            },
          },
        ],
      },
    });

    if (deletionResult.count === 0) {
      console.log('deletionResult', deletionResult);
      return res.status(400).json(info);
    }
    return res.status(200).json(info);
  })(req, res, next);
});
