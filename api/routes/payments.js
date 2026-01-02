const express = require('express');
const router = express.Router();
const asaas = require('../services/asaas');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (use database in production)
const payments = new Map();

/**
 * POST /api/payments/pix
 * Create a PIX payment
 */
router.post('/pix', async (req, res) => {
    try {
        const { customer } = req.body;

        if (!customer || !customer.name || !customer.email || !customer.cpfCnpj) {
            return res.status(400).json({
                error: 'Dados do cliente incompletos',
                required: ['name', 'email', 'cpfCnpj']
            });
        }

        // Create or find customer
        const asaasCustomer = await asaas.createCustomer(customer);

        // Generate external reference
        const externalReference = `GR-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Create PIX payment
        const payment = await asaas.createPixPayment(
            asaasCustomer.id,
            parseFloat(process.env.PRODUCT_PRICE) || 289.00,
            process.env.PRODUCT_NAME || 'Protocolo Gut Reset',
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
        const { customer, card, installments = 1 } = req.body;

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

        // Create or find customer
        const asaasCustomer = await asaas.createCustomer(customer);

        // Generate external reference
        const externalReference = `GR-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Get client IP
        const remoteIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '127.0.0.1';

        // Create card payment
        const payment = await asaas.createCardPayment(
            asaasCustomer.id,
            parseFloat(process.env.PRODUCT_PRICE) || 289.00,
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
            installments,
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
 * POST /api/payments/checkout
 * Create ASAAS hosted checkout link
 */
router.post('/checkout', async (req, res) => {
    try {
        const checkout = await asaas.createCheckout([
            {
                name: process.env.PRODUCT_NAME || 'Protocolo Gut Reset',
                description: process.env.PRODUCT_DESCRIPTION || 'Protocolo exclusivo de 15 dias',
                quantity: 1,
                value: parseFloat(process.env.PRODUCT_PRICE) || 289.00
            }
        ], {
            maxInstallmentCount: 6
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

module.exports = router;
