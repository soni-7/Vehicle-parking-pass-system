const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Vehicle Pass Verification",
    html: `<p>Your One Time Password (OTP) is: <b>${otp}</b>. It is valid for 5 minutes.</p>`
  };

  await transporter.sendMail(mailOptions);
};
