const nodemailer = require("nodemailer");

const sendEmailOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP server of Indian Railways
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Northern Railway Vehicle Pass" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for NR Vehicle Pass Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f4e79;">Northern Railway Vehicle Pass</h2>
          <p>Dear User,</p>
          <p>Your One Time Password (OTP) for vehicle pass verification is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #1f4e79; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p><strong>Note:</strong> This OTP is valid for 10 minutes only.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendEmailOTP;
