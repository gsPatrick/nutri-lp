const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Initialize Resend with API Key from environment (if available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Send payment confirmation email
 * @param {string} email - Customer email
 * @param {object} paymentData - Payment details from ASAAS
 */
async function sendPaymentConfirmation(email, paymentData) {
    try {
        if (!resend) {
            console.warn('⚠️ RESEND_API_KEY não configurada. E-mail não enviado.');
            return { success: false, error: 'API Key missing' };
        }

        const attachments = [];
        const pdfBasePath = path.join(__dirname, '../assets/pdfs');

        let hasBonus = false;
        try {
            const confirmedDate = paymentData.confirmedAt ? new Date(paymentData.confirmedAt) : new Date();
            const brTzOptions = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
            const brDateStr = confirmedDate.toLocaleDateString('pt-BR', brTzOptions);
            hasBonus = (brDateStr === '02/04/2026' || brDateStr === '03/04/2026');
        } catch (e) {
            console.warn('⚠️ Erro ao calcular data do bônus:', e.message);
        }

        // Generate Download Token
        const pId = paymentData.externalReference || email;
        const JWT_SECRET = process.env.JWT_SECRET || 'gutreset-secret-key-safe-fallback-2026';
        const token = jwt.sign({ pId, email, bns: hasBonus }, JWT_SECRET, { expiresIn: '24h' });
        const fallbackUrl = `${process.env.API_URL || 'https://geral-api-gut-reset.r954jc.easypanel.host'}/api/downloads/${token}`;

        // Main PDF (Qualquer PDF dentro de conteudo_principal)
        try {
            const mainFolder = path.join(pdfBasePath, 'conteudo_principal');
            if (fs.existsSync(mainFolder)) {
                const files = fs.readdirSync(mainFolder);
                const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf') && !f.startsWith('._'));
                
                for (const pdfFile of pdfFiles) {
                    attachments.push({
                        filename: pdfFile,
                        content: fs.readFileSync(path.join(mainFolder, pdfFile)).toString('base64')
                    });
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro ao procurar PDF principal:', e.message);
        }

        // Bonus PDF (Qualquer PDF dentro de bonus_24h) - Somente 31/03 e 01/04
        try {
            if (hasBonus) {
                const bonusFolder = path.join(pdfBasePath, 'bonus_24h');
                if (fs.existsSync(bonusFolder)) {
                    const files = fs.readdirSync(bonusFolder);
                    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf') && !f.startsWith('._'));
                    
                    for (const pdfFile of pdfFiles) {
                        attachments.push({
                            filename: pdfFile,
                            content: fs.readFileSync(path.join(bonusFolder, pdfFile)).toString('base64')
                        });
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro ao procurar PDF bônus:', e.message);
        }

        let emailResult = await resend.emails.send({
            attachments: attachments.length > 0 ? attachments : undefined,
            from: 'Gut Reset <suporte@gutreset.store>',
            to: [email],
            subject: '🎉 Seu acesso ao Gut Reset está confirmado!',
            html: EmailTemplate(paymentData, fallbackUrl),
        });

        // 🚨 Fallback if it still fails due to size (Resend error 400 with "size limit")
        if (emailResult.error && (emailResult.error.message?.includes('size limit') || emailResult.statusCode === 400)) {
            console.warn('⚠️ Tentando reenviar e-mail SEM anexos devido ao limite de tamanho...');
            emailResult = await resend.emails.send({
                from: 'Gut Reset <suporte@gutreset.store>',
                to: [email],
                subject: '🎉 Seu acesso ao Gut Reset está confirmado!',
                html: EmailTemplate(paymentData, fallbackUrl, true),
            });
        }

        if (emailResult.error) {
            console.error('❌ Erro ao enviar e-mail via Resend:', emailResult.error);
            return { success: false, error: emailResult.error };
        }

        console.log('📧 E-mail de confirmação enviado para:', email, emailResult.data?.id);
        return { success: true, id: emailResult.data?.id };

    } catch (err) {
        console.error('❌ Erro inesperado no serviço de e-mail:', err);
        return { success: false, error: err.message };
    }
}

/**
 * HTML Template for the confirmation email
 */
function EmailTemplate(paymentData, fallbackUrl, sizeWarning = false) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7cb7a3; border-radius: 10px;">
            <h1 style="color: #2E8B6A;">Bem-vinda ao Gut Reset!</h1>
            <p>Olá!</p>
            <p>Parabéns por dar esse passo importante para a sua saúde. O seu pagamento do <strong>Protocolo Gut Reset (Turma 3)</strong> foi confirmado com sucesso.</p>
            
            <div style="background-color: #f4faf8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h2 style="font-size: 18px; margin-top: 0;">Detalhes da Compra:</h2>
                <ul style="list-style: none; padding: 0;">
                    <li><strong>Produto:</strong> Protocolo Gut Reset - Turma 3</li>
                    <li><strong>Valor:</strong> R$ ${paymentData.value.toFixed(2)}</li>
                    <li><strong>Forma de Pagamento:</strong> ${paymentData.billingType}</li>
                </ul>
            </div>

            <p><strong>Acesse o Grupo de Alunas:</strong></p>
            <p>Entre no nosso grupo exclusivo para orientações e dúvidas durante o processo de 15 dias.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://chat.whatsapp.com/KsuQk8YplktL6ovX2OgY6t?mode=gi_t" 
                    style="background-color: #25D366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                    ENTRAR NO GRUPO DO WHATSAPP
                </a>
            </div>
            
            <p><strong>Seu Material:</strong></p>
            ${sizeWarning 
                ? `<p style="color: #d9534f; font-weight: bold;">⚠️ Devido ao grande tamanho dos arquivos, enviamos seu material pelo link de download seguro abaixo.</p>`
                : `<p>Verifique os <strong>arquivos em anexo</strong> neste e-mail ou utilize o link de download abaixo.</p>`
            }

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin-top: 0; color: #555; font-size: 14px;"><strong>Acesse seu material aqui:</strong></p>
                <a href="${fallbackUrl}" style="background-color: #2E8B6A; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    📁 BAIXAR PROTOCOLO COMPLETO
                </a>
                <p style="margin-bottom: 0; margin-top: 10px; color: #999; font-size: 12px;">* Este link expira em 24h por segurança.</p>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">Se tiver qualquer dúvida, responda a este e-mail.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Gut Reset. Todos os direitos reservados.</p>
        </div>
    `;
}

module.exports = {
    sendPaymentConfirmation
};
