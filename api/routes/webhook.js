const express = require('express');
const router = express.Router();
const asaas = require('../services/asaas');
const resend = require('../services/resend');

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
            case 'PAYMENT_RECEIVED':
                console.log(`✅ Evento de Sucesso: ${event} para ${payment.id}`);
                await handlePaymentSuccess(payment);
                break;
            
            case 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED':
                console.warn(`❌ [REFUSED] Pagamento ${payment.id} RECUSADO. Motivo: ${payment.refusalReason || 'Não informado pela bandeira'}`);
                break;

            case 'PAYMENT_OVERDUE':
                console.log('⏰ Pagamento vencido:', payment.id);
                break;

            case 'PAYMENT_REFUNDED':
                console.log('↩️ Pagamento estornado:', payment.id);
                await handlePaymentRefunded(payment);
                break;

            case 'PAYMENT_DELETED':
                console.log('🗑️ Cobrança deletada:', payment.id);
                break;
            default:
                console.log(`📌 Evento não tratado: ${event}`);
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


// Persistent Deduplication (prevents multiple emails for installments or retries)
// We use a Set for memory and in production this should be a DB table
const processedPurchases = new Set(); 

// Background Task Queue
const queue = [];
let isProcessingQueue = false;

/**
 * Process the background queue one by one
 */
async function processQueue() {
    if (isProcessingQueue || queue.length === 0) return;
    isProcessingQueue = true;
    
    const task = queue.shift();
    try {
        console.log(`[Queue] Processando entrega para: ${task.customerEmail} (Fila: ${queue.length})`);
        await resend.sendPaymentConfirmation(task.customerEmail, task.paymentData);
    } catch (error) {
        console.error('❌ [Queue] Erro ao enviar e-mail:', error.message);
    } finally {
        isProcessingQueue = false;
        // Small delay to respect API rate limits
        setTimeout(processQueue, 500);
    }
}

/**
 * Handle payment success (Confirmed or Received)
 */
async function handlePaymentSuccess(payment) {
    // 1. Identify unique purchase (either by Installment Group ID or External Reference)
    // If it's an installment, Asaas sends the same 'installment' ID for all parts.
    const purchaseKey = payment.installment || payment.externalReference || payment.id;
    
    if (processedPurchases.has(purchaseKey)) {
        console.log(`⏭️ [Deduplication] Compra ${purchaseKey} já processada. Ignorando duplicata.`);
        return;
    }

    // Mark as processed immediately
    processedPurchases.add(purchaseKey);

    // 2. Update local state for frontend polling
    confirmedPayments.set(payment.id, {
        paymentId: payment.id,
        customerId: payment.customer,
        externalReference: payment.externalReference,
        value: payment.value,
        status: payment.status,
        confirmedAt: new Date(),
        processed: true
    });

    // 3. Queue for email delivery
    try {
        const customer = await asaas.getCustomer(payment.customer);
        if (customer && customer.email) {
            console.log(`🚀 [Queue] Adicionando e-mail de ${customer.email} à fila.`);
            queue.push({
                customerEmail: customer.email,
                paymentData: {
                    value: payment.value,
                    billingType: payment.billingType,
                    externalReference: payment.externalReference,
                    confirmedAt: new Date()
                }
            });
            processQueue();
        } else {
            console.warn('⚠️ Cliente sem e-mail para o pagamento:', payment.id);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar dados do cliente para entrega:', error.message);
    }
}

/**
 * Handle payment confirmed or received
 */
async function handlePaymentConfirmed(payment) {
    await handlePaymentSuccess(payment);
}

async function handlePaymentReceived(payment) {
    await handlePaymentSuccess(payment);
}

/**
 * Handle payment refunded event
 */
async function handlePaymentRefunded(payment) {
    confirmedPayments.delete(payment.id);
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

/**
 * GET /api/webhook/test-email
 * Endpoint para disparar email de teste e validar anexos
 */
router.get('/test-email', async (req, res) => {
    try {
        await resend.sendPaymentConfirmation('karinerochasm@gmail.com', {
            value: 5.00,
            billingType: 'MOCK_TEST',
            externalReference: 'MOCK-123',
            confirmedAt: new Date('2026-04-01T12:00:00-03:00') // Força 01/04 para incluir bônus
        });
        await resend.sendPaymentConfirmation('patricksiqueira.developer@gmail.com', {
            value: 5.00,
            billingType: 'MOCK_TEST',
            externalReference: 'MOCK-123',
            confirmedAt: new Date('2026-04-01T12:00:00-03:00')
        });
        await resend.sendPaymentConfirmation('patrickgsiqueira@hotmail.com', {
            value: 5.00,
            billingType: 'MOCK_TEST',
            externalReference: 'MOCK-123',
            confirmedAt: new Date('2026-04-01T12:00:00-03:00')
        });
        res.json({ success: true, message: 'Test emails sent to all (karine, patricksiqueira.developer, patrickgsiqueira)' });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
