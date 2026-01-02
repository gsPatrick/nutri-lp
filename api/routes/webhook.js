const express = require('express');
const router = express.Router();

// In-memory storage for confirmed payments (use database in production)
const confirmedPayments = new Map();

/**
 * POST /api/webhook/asaas
 * Receive ASAAS webhook notifications
 * 
 * WEBHOOK URL: {API_URL}/api/webhook/asaas
 * Configure this URL in ASAAS dashboard or via API
 */
router.post('/asaas', async (req, res) => {
    try {
        // Validate webhook token (optional but recommended)
        const authToken = req.headers['asaas-access-token'];
        const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

        if (expectedToken && authToken !== expectedToken) {
            console.warn('⚠️ Webhook com token inválido:', authToken);
            // Still return 200 to avoid ASAAS retries, but log the issue
        }

        const { id: eventId, event, payment } = req.body;

        console.log('📬 Webhook recebido:', {
            eventId,
            event,
            paymentId: payment?.id,
            status: payment?.status,
            value: payment?.value,
            billingType: payment?.billingType
        });

        // Process based on event type
        switch (event) {
            case 'PAYMENT_CREATED':
                console.log('💳 Cobrança criada:', payment.id);
                break;

            case 'PAYMENT_AWAITING_RISK_ANALYSIS':
                console.log('🔍 Aguardando análise de risco:', payment.id);
                break;

            case 'PAYMENT_APPROVED_BY_RISK_ANALYSIS':
                console.log('✅ Aprovado pela análise de risco:', payment.id);
                break;

            case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
                console.log('❌ Reprovado pela análise de risco:', payment.id);
                break;

            case 'PAYMENT_CONFIRMED':
                console.log('✅ Pagamento confirmado:', payment.id);
                await handlePaymentConfirmed(payment);
                break;

            case 'PAYMENT_RECEIVED':
                console.log('💰 Pagamento recebido:', payment.id);
                await handlePaymentReceived(payment);
                break;

            case 'PAYMENT_OVERDUE':
                console.log('⏰ Pagamento vencido:', payment.id);
                break;

            case 'PAYMENT_REFUNDED':
                console.log('↩️ Pagamento estornado:', payment.id);
                await handlePaymentRefunded(payment);
                break;

            case 'PAYMENT_PARTIALLY_REFUNDED':
                console.log('↩️ Pagamento parcialmente estornado:', payment.id);
                break;

            case 'PAYMENT_CHARGEBACK_REQUESTED':
                console.log('🚨 Chargeback solicitado:', payment.id);
                break;

            case 'PAYMENT_DELETED':
                console.log('🗑️ Cobrança deletada:', payment.id);
                break;

            default:
                console.log('📌 Evento não tratado:', event);
        }

        // Always return 200 to confirm receipt
        res.status(200).json({
            received: true,
            event,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        // Return 200 even on error to prevent ASAAS from pausing the queue
        res.status(200).json({
            received: true,
            error: error.message
        });
    }
});

/**
 * Handle payment confirmed event
 */
async function handlePaymentConfirmed(payment) {
    // Store confirmed payment
    confirmedPayments.set(payment.id, {
        paymentId: payment.id,
        customerId: payment.customer,
        externalReference: payment.externalReference,
        value: payment.value,
        billingType: payment.billingType,
        status: 'CONFIRMED',
        confirmedAt: new Date()
    });

    // Here you would:
    // 1. Update database
    // 2. Send confirmation email
    // 3. Grant access to the product/course

    console.log('🎉 Acesso liberado para:', payment.externalReference);
}

/**
 * Handle payment received event (money available)
 */
async function handlePaymentReceived(payment) {
    const existing = confirmedPayments.get(payment.id);

    if (existing) {
        existing.status = 'RECEIVED';
        existing.receivedAt = new Date();
        existing.creditDate = payment.creditDate;
    } else {
        // First notification for this payment
        confirmedPayments.set(payment.id, {
            paymentId: payment.id,
            customerId: payment.customer,
            externalReference: payment.externalReference,
            value: payment.value,
            billingType: payment.billingType,
            status: 'RECEIVED',
            receivedAt: new Date(),
            creditDate: payment.creditDate
        });
    }

    console.log('💰 Dinheiro disponível em:', payment.creditDate);
}

/**
 * Handle payment refunded event
 */
async function handlePaymentRefunded(payment) {
    // Remove access
    confirmedPayments.delete(payment.id);

    // Here you would:
    // 1. Update database
    // 2. Revoke access to the product/course
    // 3. Send notification email

    console.log('🚫 Acesso revogado para:', payment.externalReference);
}

/**
 * GET /api/webhook/confirmed/:externalRef
 * Check if a payment was confirmed (for frontend polling)
 */
router.get('/confirmed/:externalRef', (req, res) => {
    const { externalRef } = req.params;

    // Find payment by external reference
    let found = null;
    for (const payment of confirmedPayments.values()) {
        if (payment.externalReference === externalRef) {
            found = payment;
            break;
        }
    }

    if (found) {
        res.json({
            confirmed: true,
            status: found.status,
            paymentId: found.paymentId,
            confirmedAt: found.confirmedAt || found.receivedAt
        });
    } else {
        res.json({ confirmed: false });
    }
});

/**
 * GET /api/webhook/test
 * Test endpoint to verify webhook is accessible
 */
router.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Webhook endpoint is active',
        webhookUrl: `${process.env.API_URL || 'http://localhost:3001'}/api/webhook/asaas`,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
