async function sendOTPEmail(toEmail, otpCode) {
  const response = await fetch('https://sendliberty.com/api/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDLIBERTY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `Mindora Support <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Mindora Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your Verification Code</h2>
          <p>Use the following 6-digit code to verify your Mindora account. It expires in 10 minutes:</p>
          <h1 style="color: #025a04; letter-spacing: 4px;">${otpCode}</h1>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    }),
    signal: AbortSignal.timeout(10000)
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[Sendliberty Error Payload]:', data);
    throw new Error(data.error || 'Failed to send OTP email via Sendliberty');
  }

  return data;
}

module.exports = { sendOTPEmail };