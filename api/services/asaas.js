/**
 * ASAAS Payment Service
 * Handles all communication with ASAAS API
 */

const ASAAS_SANDBOX_URL = 'https://api-sandbox.asaas.com/v3';
const ASAAS_PRODUCTION_URL = 'https://api.asaas.com/v3';

class AsaasService {
    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY;
        this.environment = process.env.ASAAS_ENVIRONMENT || 'sandbox';
        this.baseUrl = this.environment === 'production' ? ASAAS_PRODUCTION_URL : ASAAS_SANDBOX_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'access_token': this.apiKey,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ ASAAS API ERROR:', JSON.stringify(data, null, 2));
            const errorMsg = data.errors?.[0]?.description || data.errors?.[0]?.code || 'ASAAS API Error';
            throw new Error(errorMsg);
        }

        return data;
    }

    /**
     * Create or find a customer
     */
    async createCustomer(customerData) {
        // First, try to find existing customer by email
        const existingCustomer = await this.findCustomerByEmail(customerData.email);
        if (existingCustomer) {
            return existingCustomer;
        }

        // Create new customer
        return this.request('/customers', {
            method: 'POST',
            body: JSON.stringify({
                name: customerData.name,
                email: customerData.email,
                cpfCnpj: customerData.cpfCnpj,
                phone: customerData.phone,
                mobilePhone: customerData.phone
            })
        });
    }

    async findCustomerByEmail(email) {
        try {
            const response = await this.request(`/customers?email=${encodeURIComponent(email)}`);
            return response.data?.[0] || null;
        } catch {
            return null;
        }
    }

    /**
     * Create a PIX payment
     */
    async createPixPayment(customerId, value, description, externalReference) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Tomorrow

        const payment = await this.request('/payments', {
            method: 'POST',
            body: JSON.stringify({
                customer: customerId,
                billingType: 'PIX',
                value: value,
                dueDate: dueDate.toISOString().split('T')[0],
                description: description,
                externalReference: externalReference
            })
        });

        // Get PIX QR Code
        const pixData = await this.getPixQrCode(payment.id);

        return {
            ...payment,
            pix: pixData
        };
    }

    /**
     * Get PIX QR Code for a payment
     */
    async getPixQrCode(paymentId) {
        return this.request(`/payments/${paymentId}/pixQrCode`);
    }

    /**
     * Create a Credit Card payment
     */
    async createCardPayment(customerId, value, cardData, holderInfo, installments = 1, externalReference, remoteIp) {
        // For Credit Card, dueDate should be today in Brazil Timezone
        const now = new Date();
        const dueDate = new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString().split('T')[0];

        const paymentData = {
            customer: customerId,
            billingType: 'CREDIT_CARD',
            dueDate: dueDate,
            description: process.env.PRODUCT_NAME || 'Protocolo Gut Reset',
            externalReference: externalReference,
            remoteIp: remoteIp || '127.0.0.1',
            creditCard: {
                holderName: String(cardData.holderName).trim().toUpperCase(),
                number: String(cardData.number).replace(/\s/g, ''),
                expiryMonth: String(cardData.expiryMonth).padStart(2, '0'),
                expiryYear: String(cardData.expiryYear).length === 2 ? `20${cardData.expiryYear}` : String(cardData.expiryYear),
                ccv: String(cardData.cvv || cardData.ccv)
            },
            creditCardHolderInfo: {
                name: String(holderInfo.name).trim(),
                email: String(holderInfo.email).trim().toLowerCase(),
                cpfCnpj: String(holderInfo.cpfCnpj).replace(/\D/g, ''),
                postalCode: String(holderInfo.postalCode).replace(/\D/g, ''),
                addressNumber: String(holderInfo.addressNumber).trim(),
                addressComplement: holderInfo.addressComplement ? String(holderInfo.addressComplement).trim() : null,
                phone: String(holderInfo.phone || holderInfo.mobilePhone || '').replace(/\D/g, ''),
                mobilePhone: String(holderInfo.mobilePhone || holderInfo.phone || '').replace(/\D/g, '')
            }
        };

        // Handle installments correctly.
        if (installments > 1) {
            paymentData.installmentCount = installments;
            paymentData.installmentValue = (value / installments).toFixed(2);
        }

        // Use 'value' as the total price for both single and installment payments
        paymentData.value = value;

        // 🔍 DEBUG LOG
        console.log(`🚀 Enviando cobrança ${installments}x para ASAAS:`, {
            customerId: paymentData.customer,
            totalValue: paymentData.value,
            remoteIp: paymentData.remoteIp,
            dueDate: paymentData.dueDate
        });

        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    /**
     * Get payment status
     */
    async getPayment(paymentId) {
        return this.request(`/payments/${paymentId}`);
    }

    /**
     * Get customer details
     */
    async getCustomer(customerId) {
        return this.request(`/customers/${customerId}`);
    }

    /**
     * Create checkout link (redirect to ASAAS hosted page)
     */
    async createCheckout(items, options = {}) {
        return this.request('/checkouts', {
            method: 'POST',
            body: JSON.stringify({
                billingTypes: options.billingTypes || ['PIX', 'CREDIT_CARD'],
                chargeTypes: options.chargeTypes || ['DETACHED', 'INSTALLMENT'],
                maxInstallmentCount: options.maxInstallmentCount || 6,
                minutesToExpire: options.minutesToExpire || 120,
                callback: {
                    successUrl: `${process.env.FRONTEND_URL}/sucesso`,
                    cancelUrl: `${process.env.FRONTEND_URL}/checkout`,
                    expiredUrl: `${process.env.FRONTEND_URL}/checkout`
                },
                items: items
            })
        });
    }
}

module.exports = new AsaasService();
