const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const sendOTPEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Guest
exports.guestLogin = async (req, res) => {
  try {
    const user = await User.create({
      name: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
      authProvider: 'guest'
    });

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, authProvider: 'guest' }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing Google ID token' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return res.status(401).json({ error: 'Google email is not verified. Access denied.' });
    }

    const { email, name } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        authProvider: 'google',
        isVerified: true
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(401).json({ error: `Google auth failed: ${error.message}` });
  }
};

//signup
exports.signup = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(plainOtp, salt);

    await Otp.deleteMany({ email: cleanEmail });

    await Otp.create({
      email: cleanEmail,
      otp: hashedOtp
    });

    await sendOTPEmail(cleanEmail, plainOtp);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Verify OTP & Issue Token
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, name } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP has expired or was never requested' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        name: name || 'Wellness User',
        email: cleanEmail,
        authProvider: 'otp',
        isVerified: true
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};