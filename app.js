require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const usersRouter = require('./routers/users')
const profilesRouter = require('./routers/profiles');
const articlesRouter = require('./routers/articles');
var cors = require('cors')

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: 'blog-database',
    useCreateIndex: true
}).then(_ => console.log('MongoDB connection established')).catch(err => console.log(err));

const app = express();
app.use(cors());
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

app.use((err, req, res, next) => {
    // Send the error
    console.log(err);
    res.status(err.status || 500);
    res.send({
        'errors': {
            'body': [err.message]
        }
    });
});

app.use('/hello', () => {
    console.log('hello');
})

app.listen(+process.env.PORT || 3000, () => {
    console.log('server is running at ${process.env.PORT}`')
})

module.exports = app;