'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Shield, Copy, CheckCircle, Loader2 } from 'lucide-react';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geral-api-gut-reset.r954jc.easypanel.host';

export default function CheckoutPage() {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pixCopied, setPixCopied] = useState(false);
    const [error, setError] = useState('');

    // PIX payment data
    const [pixData, setPixData] = useState(null);
    const [pixPaymentId, setPixPaymentId] = useState(null);

    // Customer data
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        cpfCnpj: '',
        phone: ''
    });

    // Card data
    const [cardData, setCardData] = useState({
        number: '',
        holderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    const [installments, setInstallments] = useState(1);

    const handleCustomerChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleCardChange = (e) => {
        let value = e.target.value;

        // Format card number
        if (e.target.name === 'number') {
            value = value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        }

        // Format expiry
        if (e.target.name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length >= 2) {
                const month = value.slice(0, 2);
                const year = value.slice(2);
                setCardData({
                    ...cardData,
                    expiryMonth: month,
                    expiryYear: year ? `20${year}` : ''
                });
                return;
            }
        }

        setCardData({ ...cardData, [e.target.name]: value });
    };

    const validateCustomer = () => {
        if (!customer.name || !customer.email || !customer.cpfCnpj) {
            setError('Preencha todos os dados pessoais');
            return false;
        }
        // Basic CPF validation (11 digits)
        const cpf = customer.cpfCnpj.replace(/\D/g, '');
        if (cpf.length !== 11 && cpf.length !== 14) {
            setError('CPF/CNPJ inválido');
            return false;
        }
        setError('');
        return true;
    };

    // Generate PIX payment
    const handleGeneratePix = async () => {
        if (!validateCustomer()) return;

        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/payments/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao gerar PIX');
            }

            setPixData(data.pix);
            setPixPaymentId(data.paymentId);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Copy PIX code
    const handlePixCopy = () => {
        if (pixData?.copyPaste) {
            navigator.clipboard.writeText(pixData.copyPaste);
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        }
    };

    // Check PIX payment status
    const handleCheckPixPayment = async () => {
        if (!pixPaymentId) return;

        setIsProcessing(true);

        try {
            const response = await fetch(`${API_URL}/api/payments/${pixPaymentId}/status`);
            const data = await response.json();

            if (data.confirmed) {
                router.push('/sucesso');
            } else {
                setError('Pagamento ainda não confirmado. Tente novamente em alguns segundos.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            setError('Erro ao verificar pagamento');
        } finally {
            setIsProcessing(false);
        }
    };

    // Process card payment
    const handleCardPayment = async (e) => {
        e.preventDefault();
        if (!validateCustomer()) return;

        if (!cardData.number || !cardData.holderName || !cardData.expiryMonth || !cardData.cvv) {
            setError('Preencha todos os dados do cartão');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/payments/card`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    card: {
                        number: cardData.number.replace(/\s/g, ''),
                        holderName: cardData.holderName,
                        expiryMonth: cardData.expiryMonth,
                        expiryYear: cardData.expiryYear,
                        cvv: cardData.cvv
                    },
                    installments
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar pagamento');
            }

            if (data.approved) {
                router.push('/sucesso');
            } else {
                setError('Pagamento em análise. Você receberá uma confirmação por email.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className={styles.main}>
            <motion.div
                className={styles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Finalizar Compra</h1>
                    <p className={styles.subtitle}>Gut Reset - Protocolo Exclusivo</p>
                </div>

                {/* Order Summary */}
                <div className={styles.orderSummary}>
                    <h3>Resumo do Pedido</h3>
                    <div className={styles.orderItem}>
                        <span>Protocolo Gut Reset (15 dias)</span>
                        <span className={styles.price}>R$ 289,00</span>
                    </div>
                    <div className={styles.orderTotal}>
                        <span>Total</span>
                        <span>R$ 289,00</span>
                    </div>
                    <p className={styles.installments}>ou 6x de R$ 48,17 sem juros</p>
                </div>

                {/* Customer Data */}
                <div className={styles.customerSection}>
                    <h3>Seus Dados</h3>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nome completo"
                            value={customer.name}
                            onChange={handleCustomerChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="email"
                            name="email"
                            placeholder="E-mail"
                            value={customer.email}
                            onChange={handleCustomerChange}
                            required
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                name="cpfCnpj"
                                placeholder="CPF"
                                value={customer.cpfCnpj}
                                onChange={handleCustomerChange}
                                maxLength={14}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Telefone"
                                value={customer.phone}
                                onChange={handleCustomerChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${paymentMethod === 'pix' ? styles.active : ''}`}
                        onClick={() => { setPaymentMethod('pix'); setPixData(null); }}
                    >
                        <QrCode size={20} />
                        PIX
                    </button>
                    <button
                        className={`${styles.tab} ${paymentMethod === 'card' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <CreditCard size={20} />
                        Cartão
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {/* Payment Content */}
                <div className={styles.paymentContent}>
                    {paymentMethod === 'pix' ? (
                        <div className={styles.pixSection}>
                            {!pixData ? (
                                <button
                                    className={styles.submitButton}
                                    onClick={handleGeneratePix}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <><Loader2 size={20} className={styles.spinner} /> Gerando PIX...</>
                                    ) : (
                                        'Gerar QR Code PIX'
                                    )}
                                </button>
                            ) : (
                                <>
                                    <div className={styles.qrCode}>
                                        <img
                                            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                            alt="QR Code PIX"
                                            className={styles.qrImage}
                                        />
                                    </div>
                                    <p className={styles.pixInstructions}>
                                        Escaneie o QR Code ou copie o código PIX:
                                    </p>
                                    <button
                                        className={styles.copyButton}
                                        onClick={handlePixCopy}
                                    >
                                        {pixCopied ? (
                                            <><CheckCircle size={18} /> Copiado!</>
                                        ) : (
                                            <><Copy size={18} /> Copiar código PIX</>
                                        )}
                                    </button>
                                    <button
                                        className={styles.submitButton}
                                        onClick={handleCheckPixPayment}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <><Loader2 size={20} className={styles.spinner} /> Verificando...</>
                                        ) : (
                                            'Já fiz o pagamento'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <form className={styles.cardForm} onSubmit={handleCardPayment}>
                            <div className={styles.formGroup}>
                                <label>Número do Cartão</label>
                                <input
                                    type="text"
                                    name="number"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardData.number}
                                    onChange={handleCardChange}
                                    maxLength={19}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nome no Cartão</label>
                                <input
                                    type="text"
                                    name="holderName"
                                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                                    value={cardData.holderName}
                                    onChange={handleCardChange}
                                    required
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Validade</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        placeholder="MM/AA"
                                        onChange={handleCardChange}
                                        maxLength={5}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        placeholder="123"
                                        value={cardData.cvv}
                                        onChange={handleCardChange}
                                        maxLength={4}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Parcelas</label>
                                <select
                                    value={installments}
                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                    className={styles.select}
                                >
                                    <option value={1}>1x de R$ 289,00 (à vista)</option>
                                    <option value={2}>2x de R$ 144,50 sem juros</option>
                                    <option value={3}>3x de R$ 96,33 sem juros</option>
                                    <option value={4}>4x de R$ 72,25 sem juros</option>
                                    <option value={5}>5x de R$ 57,80 sem juros</option>
                                    <option value={6}>6x de R$ 48,17 sem juros</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <><Loader2 size={20} className={styles.spinner} /> Processando...</>
                                ) : (
                                    'Pagar R$ 289,00'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Trust Badges */}
                <div className={styles.trust}>
                    <div className={styles.trustBadge}>
                        <Shield size={20} />
                        <span>Pagamento 100% Seguro</span>
                    </div>
                    <p className={styles.disclaimer}>Produto sem reembolso</p>
                </div>
            </motion.div>
        </main>
    );
}
