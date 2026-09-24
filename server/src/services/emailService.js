const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    let transporter;

    // Se houver configurações de SMTP no arquivo .env, usamos elas.
    // Caso contrário, criamos uma conta de teste do Ethereal automáticamente.
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Conta teste Ethereal (Ideal para ambiente de desenvolvimento)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Organiza Viagens" <noreply@organizaviagens.com>',
        to,
        subject,
        html
    };

    const info = await transporter.sendMail(mailOptions);

    // Exibe o link do e-mail fictício enviado no terminal para você visualizar no navegador
    if (!process.env.SMTP_HOST) {
        console.log('\n-----------------------------------------');
        console.log(`✉️ [Ethereal Email] Mensagem enviada para: ${to}`);
        console.log(`🔗 [Ethereal Email] URL de Visualização: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('-----------------------------------------\n');
    }

    return info;
};

module.exports = { sendEmail };
