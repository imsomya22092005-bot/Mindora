const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (toEmail, otp) => {
  const { data, error } = await resend.emails.send({
    from: 'Mindora Support <onboarding@resend.dev>', 
    to: toEmail,
    subject: 'Your Mindora Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <h2>Verify Your Account</h2>
        <p>Use the following 6-digit code to complete your login:</p>
        <h1 style="color: #4CAF50; letter-spacing: 4px;">${otp}</h1>
        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  });

  if (error) {
    console.error('[Resend Error]:', error);
    throw new Error(error.message);
  }

  return data;
};

module.exports = sendOTPEmail;