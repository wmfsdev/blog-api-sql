const express = require('express');

const app = express();
const path = require('node:path');
const cors = require('cors');

require('dotenv').config();

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');

app.use('/', indexRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});

const { PORT } = process.env;
app.listen(PORT);
