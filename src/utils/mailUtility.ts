import  nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

// const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false,
//     auth: {
//          user: process.env.MAILER_EMAIL,
//          pass: process.env.MAILER_PASSWORD,
//           },
// })

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD, // Use App Password
    },
});


async function testMail() {
    try {
        await transporter.verify();
        console.log("SMTP Connection Successful ✅");
    } catch (error) {
        console.error("SMTP Connection Failed ❌", error);
    }
}

testMail();

class MailUtility{

    static async sendMail(email:string, otp:string, subject:string):Promise<{message:string}>
    {
        console.log("MAILER_EMAIL:", process.env.MAILER_EMAIL);
        console.log("MAILER_PASSWORD:", process.env.MAILER_PASSWORD);

        if (!process.env.MAILER_EMAIL || !process.env.MAILER_PASSWORD) {

            throw new Error("Missing MAILER_EMAIL or MAILER_PASSWORD in environment variables");
        }

        const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elevio OTP</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #edf2f7;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <tr>
            <td style="padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">Elevio</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px;">
                <h2 style="color: #1a202c; margin-bottom: 24px; font-weight: 600;">${subject}</h2>
                <p style="margin-bottom: 20px; color: #4a5568;">Hello,</p>
                <p style="margin-bottom: 20px; color: #4a5568;">You've requested to sign up for your Elevio account. Please use the verification code below to complete your registration:</p>
                <div style="background: linear-gradient(to right, #667eea, #764ba2); border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">${otp}</span>
                </div>
                <p style="margin-bottom: 20px; color: #4a5568;">This verification code will expire in 1 minutes.</p>
                <p style="margin-bottom: 30px; color: #4a5568;">Welcome to Elevio!</p>
                <p style="color: #718096; font-size: 13px; font-style: italic;">This is an automated message, please do not reply to this email.</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f7fafc; color: #718096; text-align: center; padding: 20px; font-size: 13px; border-top: 1px solid #e2e8f0;">
                © 2024 Elevio. All rights reserved.
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