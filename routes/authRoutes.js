const express = require('express')
const router = express.Router();
const authController = require('../controllers/authController')

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.put('/account-verification', authController.accountVerify)
router.put('/forgot-password', authController.forgotPassword)
router.put('/change-password', authController.changePassword)

module.exports = router