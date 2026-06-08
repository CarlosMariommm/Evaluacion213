import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

//#1- Configuro el transportador de nodemailer usando el email y contraseña de entorno
const transporter = nodemailer.createTransport({
    service: 'gmail', // Asumo Gmail porque el correo proporcionado termina en gmail.com
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        //#2- Configuro y envío el correo electrónico
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
