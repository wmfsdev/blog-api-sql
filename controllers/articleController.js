const asyncHandler = require('express-async-handler');

const prisma = require('../prisma/client');

exports.article_get = asyncHandler(async (req, res, next) => {
  // get all articles

  const articles = await prisma.article.findMany();
  console.log('sdfsf');
  console.log(articles);
});
