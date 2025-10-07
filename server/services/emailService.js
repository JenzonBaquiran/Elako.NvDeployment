const nodemailer = require("nodemailer");

// Email configuration
// IMPORTANT: Replace with your actual email credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "elakonv@gmail.com", // Replace with your actual Gmail address
    pass: "clqjphzkugqlhvrw", // Replace with your app password (remove spaces)
  },
});

// SETUP INSTRUCTIONS:
// 1. Enable 2-Factor Authentication on your Gmail account
// 2. Go to Google Account → Security → App passwords
// 3. Generate app password for "Mail"
// 4. Use the 16-character password here (remove spaces)
// 5. Replace both user and pass values above

// FOR TESTING ONLY - Use Ethereal Email (fake SMTP service):
// const transporter = nodemailer.createTransport({
//   host: 'smtp.ethereal.email',
//   port: 587,
//   auth: {
//     user: 'ethereal.user@ethereal.email',
//     pass: 'ethereal.pass'
//   }
// });

// Alternative configurations for other email services:
//
// For Outlook/Hotmail:
// {
//   service: 'outlook',
//   auth: {
//     user: 'your-email@outlook.com',
//     pass: 'your-password'
//   }
// }
//
// For custom SMTP:
// {
//   host: 'smtp.your-email-provider.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'your-email@domain.com',
//     pass: 'your-password'
//   }
// }

// Verify transporter configuration (commented out to avoid startup errors)
// transporter.verify((error, success) => {
//   if (error) {
//     console.log('❌ Email transporter error:', error);
//   } else {
//     console.log('✅ Email server is ready to send messages');
//   }
// });

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, username) => {
  try {
    const mailOptions = {
      from: '"ELako.NV Support" <elakonv@gmail.com>', // Your Gmail address
      to: email,
      subject: "Password Reset OTP - ELako.NV",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50;">ELako.NV</h1>
            <p style="color: #666;">Digital Marketing Solution For MSMEs</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; line-height: 1.6;">
              Hello <strong>${username}</strong>,
            </p>
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password. Please use the following OTP (One-Time Password) to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #4CAF50; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This OTP is valid for <strong>10 minutes</strong>. If you didn't request this password reset, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; line-height: 1.4;">
                For security reasons, never share this OTP with anyone. If you have any concerns, please contact our support team.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>&copy; 2025 ELako.NV. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
