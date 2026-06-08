import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Hospital Rosales" <${process.env.USER_EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        });
        return info;
    } catch (error) {
        console.log("error" + error);
        throw error;
    }
};

export default transporter;
