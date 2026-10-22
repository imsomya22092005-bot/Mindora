const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Mindora Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your MindWellness Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify Your Account</h2>
        <p>Use the following 6-digit code to verify your login/registration:</p>
        <h1 style="color: #4CAF50; letter-spacing: 4px;">${otp}</h1>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;