const express = require('express');
const router = express.Router();
const asaas = require('../services/asaas');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (use database in production)
const payments = new Map();

/**
 * Parse price from env (handles both comma and dot)
 */
function getProductPrice() {
    const priceStr = process.env.PRODUCT_PRICE || '289.00';
    // Replace comma with dot for proper parsing
    const price = parseFloat(priceStr.replace(',', '.'));
    return isNaN(price) ? 289.00 : price;
}

/**
 * Calculate max installments based on price (min R$ 5 per installment)
 */
function getMaxInstallments(totalPrice) {
    const minPerInstallment = 5;
    const maxAllowed = 6;
    const maxPossible = Math.floor(totalPrice / minPerInstallment);
    return Math.min(maxPossible, maxAllowed);
}

/**
 * POST /api/payments/pix
 * Create a PIX payment
 */
router.post('/pix', async (req, res) => {
    try {
        const { customer, testMode, price } = req.body;

        if (!customer || !customer.name || !customer.email || !customer.cpfCnpj) {
            return res.status(400).json({
                error: 'Dados do cliente incompletos',
                required: ['name', 'email', 'cpfCnpj']
            });
        }

        // Use test price if in test mode, otherwise use product price
        let productPrice = getProductPrice();
        if (testMode && price) {
            productPrice = Math.max(5, parseFloat(price));
        }

        // Validate minimum value (R$ 5 for PIX)
        if (productPrice < 5) {
            return res.status(400).json({
                error: 'O valor mínimo para cobrança PIX é R$ 5,00'
            });
        }

        // Create or find customer
        const asaasCustomer = await asaas.createCustomer(customer);

        // Generate external reference
        const externalReference = `GR-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Create PIX payment
        const payment = await asaas.createPixPayment(
            asaasCustomer.id,
            productPrice,
            testMode ? 'TESTE - Gut Reset' : (process.env.PRODUCT_NAME || 'Protocolo Gut Reset'),
            externalReference
        );

        // Store payment info
        payments.set(payment.id, {
            id: payment.id,
            externalReference,
            customerId: asaasCustomer.id,
            customerEmail: customer.email,
            status: payment.status,
            value: payment.value,
            billingType: 'PIX',
            createdAt: new Date()
        });

        res.json({
            success: true,
            paymentId: payment.id,
            externalReference,
            value: payment.value,
            status: payment.status,
            pix: {
                qrCodeBase64: payment.pix.encodedImage,
                copyPaste: payment.pix.payload,
                expirationDate: payment.pix.expirationDate
            }
        });

    } catch (error) {
        console.error('PIX Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payments/card
 * Create a Credit Card payment
 */
router.post('/card', async (req, res) => {
    try {
        const { customer, card, installments = 1, testMode, price } = req.body;

        if (!customer || !customer.name || !customer.email || !customer.cpfCnpj) {
            return res.status(400).json({
                error: 'Dados do cliente incompletos',
                required: ['name', 'email', 'cpfCnpj']
            });
        }

        if (!card || !card.number || !card.holderName || !card.expiryMonth || !card.expiryYear || !card.cvv) {
            return res.status(400).json({
                error: 'Dados do cartão incompletos',
                required: ['number', 'holderName', 'expiryMonth', 'expiryYear', 'cvv']
            });
        }

        // Use test price if in test mode, otherwise use product price
        let productPrice = getProductPrice();
        if (testMode && price) {
            productPrice = Math.max(5, parseFloat(price));
        }

        // Validate minimum value (R$ 5 for card)
        if (productPrice < 5) {
            return res.status(400).json({
                error: 'O valor mínimo para cobrança via Cartão é R$ 5,00'
            });
        }

        // Validate installments
        const maxInstallments = getMaxInstallments(productPrice);
        const validInstallments = Math.min(Math.max(1, installments), maxInstallments);

        if (installments > maxInstallments) {
            return res.status(400).json({
                error: `Máximo de ${maxInstallments}x para esse valor. Cada parcela deve ser no mínimo R$ 5,00.`
            });
        }

        // Create or find customer
        const asaasCustomer = await asaas.createCustomer(customer);

        // Generate external reference
        const externalReference = `GR-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Get client IP
        const remoteIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '127.0.0.1';

        // Create card payment
        const payment = await asaas.createCardPayment(
            asaasCustomer.id,
            productPrice,
            card,
            {
                name: customer.name,
                email: customer.email,
                cpfCnpj: customer.cpfCnpj,
                postalCode: customer.postalCode || '00000-000',
                addressNumber: customer.addressNumber || '0',
                phone: customer.phone || '',
                remoteIp
            },
            validInstallments,
            externalReference
        );

        // Store payment info
        payments.set(payment.id, {
            id: payment.id,
            externalReference,
            customerId: asaasCustomer.id,
            customerEmail: customer.email,
            status: payment.status,
            value: payment.value,
            billingType: 'CREDIT_CARD',
            createdAt: new Date()
        });

        // Check if payment was approved
        const isApproved = ['CONFIRMED', 'RECEIVED'].includes(payment.status);

        res.json({
            success: true,
            paymentId: payment.id,
            externalReference,
            value: payment.value,
            status: payment.status,
            approved: isApproved,
            message: isApproved ? 'Pagamento aprovado!' : 'Pagamento em processamento'
        });

    } catch (error) {
        console.error('Card Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/payments/:id/status
 * Check payment status
 */
router.get('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await asaas.getPayment(id);

        const isConfirmed = ['CONFIRMED', 'RECEIVED'].includes(payment.status);

        res.json({
            paymentId: payment.id,
            status: payment.status,
            confirmed: isConfirmed,
            value: payment.value,
            billingType: payment.billingType
        });

    } catch (error) {
        console.error('Status Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/payments/config
 * Get payment configuration (for frontend)
 */
router.get('/config', (req, res) => {
    const productPrice = getProductPrice();
    const maxInstallments = getMaxInstallments(productPrice);

    const installmentOptions = [];
    for (let i = 1; i <= maxInstallments; i++) {
        const valuePerInstallment = (productPrice / i).toFixed(2);
        installmentOptions.push({
            installments: i,
            value: parseFloat(valuePerInstallment),
            label: i === 1
                ? `1x de R$ ${valuePerInstallment} (à vista)`
                : `${i}x de R$ ${valuePerInstallment} sem juros`
        });
    }

    res.json({
        productPrice,
        productName: process.env.PRODUCT_NAME || 'Protocolo Gut Reset',
        maxInstallments,
        installmentOptions
    });
});

/**
 * POST /api/payments/checkout
 * Create ASAAS hosted checkout link
 */
router.post('/checkout', async (req, res) => {
    try {
        const productPrice = getProductPrice();
        const maxInstallments = getMaxInstallments(productPrice);

        const checkout = await asaas.createCheckout([
            {
                name: process.env.PRODUCT_NAME || 'Protocolo Gut Reset',
                description: process.env.PRODUCT_DESCRIPTION || 'Protocolo exclusivo de 15 dias',
                quantity: 1,
                value: productPrice
            }
        ], {
            maxInstallmentCount: maxInstallments
        });

        res.json({
            success: true,
            checkoutUrl: checkout.url,
            checkoutId: checkout.id
        });

    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payments/test-checkout
 * Create a test checkout with custom price (for testing only)
 */
router.post('/test-checkout', async (req, res) => {
    try {
        const { price = 5 } = req.body;
        const testPrice = Math.max(5, parseFloat(price)); // Minimum R$ 5

        const checkout = await asaas.createCheckout([
            {
                name: 'TESTE - Gut Reset',
                description: 'Pagamento de teste',
                quantity: 1,
                value: testPrice
            }
        ], {
            maxInstallmentCount: 1
        });

        res.json({
            success: true,
            testPrice,
            checkoutUrl: checkout.url,
            checkoutId: checkout.id,
            message: `Link de teste com R$ ${testPrice.toFixed(2)}`
        });

    } catch (error) {
        console.error('Test Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
