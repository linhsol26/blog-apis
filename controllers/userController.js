const UserModel = require('../models/user');
const ApiError = require('../models/apiError');
const authController = require('./authController');
const validations = require('../utils/validation');

const register = (req, res, next) => {
    const { username, email, password } = req.body.user;
  
    if (!username) return next(new ApiError('Please provide username'));
    if (!email) return next(new ApiError('Please provide email'));
    if (!validations.emailRegex.test(email)) return next(new ApiError('Email address not valid'));
    if (!password) return next(new ApiError('Please provide password'));
  
    UserModel.findOne({ username })
        .then(document => {
        if (document !== null) {
            return Promise.reject(new ApiError('Username already exists'));
        }
        return UserModel.findOne({email}) 
        })
        .then(document => {
        if (document !== null) {
            return Promise.reject(new ApiError('Email already exists'));
        }
        return  UserModel.create(req.body.user)
        })
        .then(document => {
        authController.generateToken(document, (err, token) => {
            if (err) return Promise.reject(err);
            res.json(getApiResponse(document, token));
        });
        })
    .catch(err => next(err));
};

const login = (req, res, next) => {
    const { email, password } = req.body.user;
  
    if (!email) return next(new ApiError('Please provide email'));
    if (!validations.emailRegex.test(email)) return next(new ApiError('Email address not valid'));
    if (!password) return next(new ApiError('Please provide password'));
  
    UserModel.findOne({ email })
        .then(document => {
        if (document === null) {
            return Promise.reject(new ApiError('No account registered with that email'));
        }
        if (!document.verifyPassword(password)) {
            return Promise.reject(new ApiError('Invalid username / password'));
        }
        authController.generateToken(document, (err, token) => {
            if (err) return Promise.reject(err);
            res.json(getApiResponse(document, token));
        });
        })
        .catch(err => next(err));
};

const getCurrentUser = (req, res, next) => {
    UserModel.findById(req.user.userId)
        .then(document => {
        if (document === null) return Promise.reject(new ApiError('User not found'));
        res.json(getApiResponse(document, req.token));
        })
        .catch(err => next(err));
}

const updateCurrentUser = async (req, res, next) => {
    const { email, username, bio, image } = req.body.user;
  
    let updateObject = {};

    const file = req.file
    if (!file) {
        return res.status(400).send('No image in the request')
    }

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    
    if (email) updateObject['email'] = email;
    if (username) updateObject['username'] = `${basePath}${fileName}`;
    if (bio) updateObject['bio'] = bio;
    if (image) updateObject['image'] = image;
    if (Object.keys(updateObject).length === 0) return next(new ApiError('At least one field is required'));
  
    if (email) {
      if (!validations.emailRegex.test(email)) return next(new ApiError('Invalid email format'))
      const document = await UserModel.findOne({email});
      if (document) return next(new ApiError('Email already in use'));
    }
  
    if (username) {
      const document = await UserModel.findOne({username});
      if (document) return next(new ApiError('Username already in use'));
    }
  
    UserModel.findByIdAndUpdate(req.user.userId, updateObject, { new: true })
        .then(document => {
        res.json(getApiResponse(document, req.token));
        })
        .catch(err => next(err));
}

const getApiResponse = (userDocument, token) => {
    return { user: {
      email: userDocument.email,
      token,
      username: userDocument.username,
      bio: userDocument.bio,
      image: userDocument.image
    }};
}
  
module.exports = {
    register,
    login,
    getCurrentUser,
    updateCurrentUser
}