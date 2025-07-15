const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // e.g., yourgovemail@gmail.com
    pass: process.env.EMAIL_PASS,      // App Password (not regular password)
  },
});

const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Northern Railway" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
