const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const passport = require('passport');
const prisma = require('../prisma/client');
require('dotenv').config();

// GET article by ID
exports.article_get = asyncHandler(async (req, res, next) => {
  if (req.headers.origin !== process.env.CMS_URL) {
    const article = await prisma.article.findMany({
      where: {
        AND: [
          {
            id: {
              equals: Number(req.params.id),
            },
          },
          {
            publish: {
              equals: true,
            },
          },
        ],
      },
    });
    return res.json(article);
  }
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'not authorised' });
    }
    const articles = await prisma.article.findMany({
      where: {
        id: {
          equals: Number(req.params.id),
        },
      },
    });
    return res.json(articles);
  })(req, res, next);
});

// GET all comments for article
exports.article_comments_get = asyncHandler(async (req, res, next) => {
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
  return res.json(comments);
});

exports.articles_get = asyncHandler(async (req, res, next) => {
  if (req.headers.origin !== process.env.CMS_URL) {
    const articles = await prisma.article.findMany({
      orderBy: {
        id: 'asc',
      },
      where: {
        publish: true,
      },
    });
    return res.json(articles);
  }
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'not authorised' });
    }
    const articles = await prisma.article.findMany({
      orderBy: {
        timestamp: 'asc',
      },
    });
    return res.json(articles);
  })(req, res, next);
});

exports.article_delete = asyncHandler(async (req, res, next) => {
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'not authorised' });
    }
    const article = await prisma.article.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    return res.status(200).json(article);
  })(req, res, next);
});

// PUT Article
exports.article_update = asyncHandler(async (req, res, next) => {
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'not authorised' });
    }
    const update = await prisma.article.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title: req.body.title || undefined,
        body: req.body.body || undefined,
        publish: req.body.publish,
      },
    });
    return res.status(200).json(update);
  })(req, res, next);
});

// POST Article
exports.article_post = asyncHandler(async (req, res, next) => {
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'not authorised' });
    }

    const { title, body, thumbnail } = req.body;
    const { id } = user;

    await prisma.article.create({
      data: {
        title,
        body,
        thumbnail,
        category: 'social',
        authorId: id,
      },
    });
    return res.status(200).json();
  })(req, res, next);
});

exports.user_comment_post = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const err = new Error('validation failed');
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }
    passport.authenticate('jwt', async (err, user, info) => {
      if (!user) {
        return res.status(401).json({ message: 'not authorised' });
      }
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
    const status = error.statusCode;
    res.status(status).json(error.data);
  }
};

exports.user_comment_delete = asyncHandler(async (req, res, next) => {
  passport.authenticate('jwt', async (err, user, info) => {
    if (!user) {
      return res.status(401).json({ message: 'not authorised' });
    }

    const userId = Number(user.id);
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
      return res.status(400).json();
    }
    return res.status(200).json(info);
  })(req, res, next);
});
