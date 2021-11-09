const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
  
router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/', authController.checkAuthorization, userController.getCurrentUser);
router.put('/', authController.checkAuthorization, userController.updateCurrentUser);
// router.put('/update', authController.checkAuthorization, userController.updateAvatar);

module.exports = router;