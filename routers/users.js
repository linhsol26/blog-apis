const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValidFile = FILE_TYPE_MAP[file.mimetype]
        cb(isValidFile ? null : new Error('invalid image type'), 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-')
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})
  
const uploadOptions = multer({ storage: storage })
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/', authController.checkAuthorization, userController.getCurrentUser);
router.put('/', uploadOptions.single('image'), authController.checkAuthorization, userController.updateCurrentUser)

module.exports = router;