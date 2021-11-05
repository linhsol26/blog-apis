require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const usersRouter = require('./routers/users')
const profilesRouter = require('./routers/profiles');
const articlesRouter = require('./routers/articles');

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    dbName: 'blog-database'
}).then(_ => console.log('MongoDB connection established')).catch(err => console.log(err));

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

const api = process.env.API_URL
app.use(`${api}/users`, usersRouter);
app.use(`${api}/profiles`, profilesRouter);
app.use(`${api}/articles`, articlesRouter);

app.use((req, res, next) => {
    next(createError(404));
});

module.exports = app;