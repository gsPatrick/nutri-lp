const { Resend } = require('resend');

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

        const { data, error } = await resend.emails.send({
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

                    <p><strong>Acesse agora o seu material:</strong></p>
                    <p>O conteúdo completo está disponível no link abaixo. Não esqueça de entrar no nosso grupo VIP de alunos para receber todo o suporte.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://lpnutri.com.br'}/sucesso" 
                           style="background-color: #2E8B6A; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                            ACESSAR MEU PROTOCOLO
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
