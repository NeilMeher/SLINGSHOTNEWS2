export class EmailService {
    /**
     * Send verification email
     */
    async sendVerificationEmail(email: string, token: string, username: string) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

        console.log(`
        -----------------------------------------
        📧 EMAIL SENT TO: ${email}
        👤 USER: ${username}
        🔗 VERIFY URL: ${verifyUrl}
        ⏰ EXPIRES: 24 hours
        -----------------------------------------
        `);

        // In production, integrate with SendGrid/Nodemailer/AWS SES:
        /*
        await this.sendMail({
            to: email,
            subject: 'verify your vibe on slingshot 🚀',
            html: `
                <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
                    <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -1px;">verify your vibe 🚀</h1>
                    <p style="color: #666;">yo ${username}, welcome to the chain. verify your email to start vibing with the realest news.</p>
                    <a href="${verifyUrl}" style="display: inline-block; background: #FF007A; color: #fff; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: 900; margin-top: 20px;">VERIFY EMAIL</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #333;">this link expires in 24 hours. no cap.</p>
                </div>
            `
        });
        */

        return true;
    }
}

export const emailService = new EmailService();
