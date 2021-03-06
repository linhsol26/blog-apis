const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validations = require('../utils/validation');

const saltRounds = 10;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: validations.emailRegex
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: 'https://static.productionready.io/images/smiley-cyrus.jpg'
    },
    following: {
        type: Number,
        default: 0
    },
    followers: {
        type: Number,
        default: 0
    }
});

userSchema.pre('save', function(next) {
    bcrypt.hash(this.password, saltRounds)
        .then(hashed => {
            this.password = hashed;
            next();
        })
        .catch(err => next(err));
});

userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user', userSchema);