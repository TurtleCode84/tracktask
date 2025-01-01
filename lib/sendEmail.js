import nodemailer from "nodemailer";

export default async function sendEmail(to, subject, html) {
    const smtpAuth = process.env.SMTP_AUTH.split(":");
    const transporter = nodemailer.createTransport({
        host: "smtppro.zoho.com",
        port: 465,
        secure: true,
        auth: {
          user: smtpAuth[0],
          pass: smtpAuth[1],
        }
    });
    const response = await transporter.sendMail({
        from: '"TrackTask Notifications" <notifications@tracktask.eu.org>',
        to: to,
        replyTo: "hello@tracktask.eu.org",
        subject: subject,
        html: html,
    });
    return response;
}