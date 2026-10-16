const express = require('express');
const router = express.Router();

const {
  guestLogin,
  googleAuth,
  signup,
  verifyOTP,
  registerWithPassword,
  loginWithPassword
} = require('../controllers/authController');

router.post('/guest', guestLogin);
router.post('/google', googleAuth);
router.post('/register', registerWithPassword);
router.post('/login', loginWithPassword);
router.post('/otp/send', signup);    
router.post('/otp/verify', verifyOTP);  

module.exports = router;