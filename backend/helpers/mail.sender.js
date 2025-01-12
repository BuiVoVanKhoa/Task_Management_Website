import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const mailSender = async ({ email, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const message = {
    from: "Task Management",
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error.message };
  }
};

export default mailSender;

// USER: TaskManagement
// PASSWORD: ucss xhlt awtf eehj