const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const passport = require('passport');
const prisma = require('../prisma/client');
require('dotenv').config()

// GET article by ID
exports.article_get = asyncHandler(async (req, res, next) => {
  console.log('req.params', req.params);
  // these are just comments but we need the article as well!
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
  console.log('yes you know', article);
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
  // console.log(comments);
  return res.json(comments);
});

exports.articles_get = asyncHandler(async (req, res, next) => {
  // NOT from CMS - any origin
  console.log('header origin', req.headers.origin);
  if (req.headers.origin !== process.env.CMS_URL ) { // "http://localhost:5173"
    console.log('not CMS');
    const articles = await prisma.article.findMany({
      orderBy: {
        id: 'asc',
      },
      where: {
        publish: true,
      },
    });
    return res.json(articles);
  } // ELSE can only be CMS
  console.log('pre auth post header check');
  passport.authenticate('jwt', async (err, user, info) => {
    console.log('auth start');
    if (!user) {
      console.log('no user');
      return res.status(401).json({ message: 'not authorised' });
    }
    const articles = await prisma.article.findMany({});
    console.log('articles: ', articles);
    return res.json(articles);
    // return res.status(200).json();
  })(req, res, next);
});

exports.article_delete = asyncHandler(async (req, res, next) => {
  console.log("article_delete", req.params.id);
  const article = await prisma.article.delete({
    where: {
      id: Number(req.params.id),
    },
  });
  return res.status(200).json(article);
});

// PUT Article
exports.article_update = asyncHandler(async (req, res, next) => {
  console.log("test log", req.body)
  // const { title, body } = req.body
  // need to update publish status as well
  // supply function for data property?

  const update = await prisma.article.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      title: req.body.title || undefined,
      body: req.body.body || undefined,
      publish: req.body.publish // || undefined, // !(/true/).test(req.body.publish)
    }
  })
  return res.status(200).json(update)
})


// POST Article
exports.article_post = asyncHandler(async (req, res, next) => {
  const { title, body } = req.body
  console.log("title: ", title)
  console.log("body: ", body)
  await prisma.article.create({
    data: {
      title: title,
      body: body,
      category: 'social',
      authorId: 1,
    },
  });
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




// GET all articles
// exports.articles_get = asyncHandler(async (req, res, next) => {
//   // if coming from CMS authenticate first - success:
//   // retrieve all articles otherwise retrieve only those set to publish: true
//   // console.log(req.hostname)
//   if (req.hostname === process.env.CMS_URL) { // CMS check
//     passport.authenticate('jwt', async (err, user, info) => {
//       if (!user) {
//         return res.status(401).json({ message: 'not authorised' });
//       }
//       const articles = await prisma.article.findMany({});
//       return res.json(articles);
//       // return res.status(200).json();
//     })(req, res, next);
//   } else {
//     // FOR THE BLOG
//     const articles = await prisma.article.findMany({
//       orderBy: {
//         id: 'asc',
//       },
//       where: {
//         publish: true,
//       },
//     });
//     return res.json(articles);
//   }
// });
