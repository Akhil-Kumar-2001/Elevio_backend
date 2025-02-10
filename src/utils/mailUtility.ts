import  nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
         user: process.env.MAILER_EMAIL,
         pass: process.env.MAILER_PASSWORD,
          },
})

class MailUtility{

    static async sendMail(email:string, otp:number, subject:string):Promise<{message:string}>
    {
        if (!process.env.MAILER_EMAIL || !process.env.MAILER_PASSWORD) {

            throw new Error("Missing MAILER_EMAIL or MAILER_PASSWORD in environment variables");
        }

        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coder Buddy OTP</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 5px; border: 1px solid #ffd700;">
            <tr>
                <td style="padding: 20px; background-color: #374151; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0;">Coder Buddy</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
                    <p style="margin-bottom: 15px;">Hello,</p>
                    <p style="margin-bottom: 15px;">You've requested to sign up for your Coder Buddy account. Use the following OTP to complete the process:</p>
                    <div style="background-color: #ffd700; border-radius: 5px; padding: 15px; text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                    </div>
                    <p style="margin-bottom: 15px;">This OTP will expire in 10 minutes.</p>
                    <p style="margin-bottom: 20px;">Thank you for using Coder Buddy!</p>
                    <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
                </td>
            </tr>
            <tr>
                <td style="background-color: #f4f4f4; color: #333; text-align: center; padding: 10px; font-size: 12px;">
                    © 2024 Coder Buddy. All rights reserved.
                </td>
            </tr>
        </table>
    </body>
    </html>
`;

        const mailOption = {
            from: `Elevio <${process.env.MAILER_EMAIL}>`,
            to:email,
            subject:subject,
            html:htmlContent
        };


        try {
            await transporter.sendMail(mailOption);
            return {message:"Mail send successfully"}
        } catch (error) {
            console.log("error",error);
            
            throw new Error('Failed to send OTP')
        }


    }

}

export default MailUtility;