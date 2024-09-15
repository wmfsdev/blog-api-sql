const express = require('express');

const app = express();
const path = require('node:path');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');
const articleRouter = require('./routes/articles');

app.use('/', indexRouter);
app.use('/articles', articleRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});

const { PORT } = process.env;
app.listen(PORT);
