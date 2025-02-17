import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { saveVerificationCode } from "./verification.helper.js";
dotenv.config();

export const mailSender = async ({ email, subject, html }) => {
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

// Function to send verification email
export const sendVerificationEmail = async (email, verificationCode) => {
  saveVerificationCode(email, verificationCode);

  const subject = "Verify registration email";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50; text-align: center;">Email authentication</h2>
      <p style="color: #34495e;">Hello,</p>
      <p style="color: #34495e;">Your authentication code is: <strong>${verificationCode}</strong></p>
      <p style="color: #34495e;">This code will expire after 5 minutes.</p>
      <p style="color: #34495e;">If you did not request this authentication, please ignore this email.</p>
    </div>
  `;

  return mailSender({ email, subject, html });
};

// Function to send welcome email
export const sendWelcomeEmail = async (email, username) => {
  const subject = "Welcome to Task Management";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50; text-align: center;">Welcome to Task Management!</h2>
      <p style="color: #34495e;">Hello ${username},</p>
      <p style="color: #34495e;">Your account has been successfully created. You can log in now to start using our services.</p>
      <p style="color: #34495e;">Wish you have great experiences!</p>
    </div>
  `;

  return mailSender({ email, subject, html });
};