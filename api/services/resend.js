const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Initialize Resend with API Key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send payment confirmation email
 * @param {string} email - Customer email
 * @param {object} paymentData - Payment details from ASAAS
 */
async function sendPaymentConfirmation(email, paymentData) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ RESEND_API_KEY não configurada. E-mail não enviado.');
            return { success: false, error: 'API Key missing' };
        }

        const attachments = [];
        const pdfDir = path.join(__dirname, '../assets/pdfs');

        // Main PDF
        try {
            const mainPdfPath = path.join(pdfDir, 'gut_reset_protocolo.pdf');
            if (fs.existsSync(mainPdfPath)) {
                attachments.push({
                    filename: 'gut_reset_protocolo.pdf',
                    content: fs.readFileSync(mainPdfPath)
                });
            }
        } catch (e) {
            console.warn('⚠️ Erro ao ler PDF principal:', e.message);
        }

        // Bonus PDF (Somente compras do dia 01/04/2026)
        try {
            const confirmedDate = paymentData.confirmedAt ? new Date(paymentData.confirmedAt) : new Date();
            const brTzOptions = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
            const brDateStr = confirmedDate.toLocaleDateString('pt-BR', brTzOptions);
            
            if (brDateStr === '01/04/2026') {
                const bonusPdfPath = path.join(pdfDir, 'bonus_exames.pdf');
                if (fs.existsSync(bonusPdfPath)) {
                    attachments.push({
                        filename: 'bonus_exames.pdf',
                        content: fs.readFileSync(bonusPdfPath)
                    });
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro ao avaliar PDF bônus:', e.message);
        }

        const { data, error } = await resend.emails.send({
            attachments: attachments.length > 0 ? attachments : undefined,
            from: 'Gut Reset <contato@gutreset.lpnutri.com.br>', // Replace with your verified domain
            to: [email],
            subject: '🎉 Seu acesso ao Gut Reset está confirmado!',
            html: `
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
                    <p>Verifique os <strong>arquivos em anexo</strong> neste e-mail para baixar o seu Protocolo Gut Reset (e os bônus, caso se aplique).</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://lpnutri.com.br'}/sucesso" 
                           style="background-color: #2E8B6A; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                            ACESSAR MEU PAINEL
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #666;">Se tiver qualquer dúvida, responda a este e-mail ou entre em contato pelo nosso suporte.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Gut Reset. Todos os direitos reservados.</p>
                </div>
            `,
        });

        if (error) {
            console.error('❌ Erro ao enviar e-mail via Resend:', error);
            return { success: false, error };
        }

        console.log('📧 E-mail de confirmação enviado para:', email, data.id);
        return { success: true, id: data.id };

    } catch (err) {
        console.error('❌ Erro inesperado no serviço de e-mail:', err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendPaymentConfirmation
};
