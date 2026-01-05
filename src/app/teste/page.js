'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Shield, Copy, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import styles from '../checkout/page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geral-api-gut-reset.r954jc.easypanel.host';
const TEST_PRICE = 5.00; // Preço de teste fixo

export default function TestCheckoutPage() {
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

    const handleCustomerChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleCardChange = (e) => {
        let value = e.target.value;

        if (e.target.name === 'number') {
            value = value.replace(/\D/g, '').slice(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        }

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
        const cpf = customer.cpfCnpj.replace(/\D/g, '');
        if (cpf.length !== 11 && cpf.length !== 14) {
            setError('CPF/CNPJ inválido');
            return false;
        }
        setError('');
        return true;
    };

    // Generate PIX payment with test price
    const handleGeneratePix = async () => {
        if (!validateCustomer()) return;

        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/payments/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    testMode: true,
                    price: TEST_PRICE
                })
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

    // Auto-poll PIX payment status
    useEffect(() => {
        if (!pixPaymentId) return;

        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/payments/${pixPaymentId}/status`);
                const data = await response.json();

                if (data.confirmed) {
                    router.push('/sucesso');
                }
            } catch (err) {
                console.error('Error checking PIX status:', err);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [pixPaymentId, router]);

    const handlePixCopy = () => {
        if (pixData?.copyPaste) {
            navigator.clipboard.writeText(pixData.copyPaste);
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        }
    };

    // Process card payment with test price
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
                    installments: 1,
                    testMode: true,
                    price: TEST_PRICE
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar pagamento');
            }

            router.push('/sucesso');

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
                {/* Test Mode Banner */}
                <div style={{
                    background: 'rgba(255, 200, 0, 0.2)',
                    border: '2px solid #FFD700',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertTriangle size={24} color="#FFD700" />
                    <div>
                        <strong style={{ color: '#FFD700' }}>MODO TESTE</strong>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>
                            Pagamento de R$ 5,00 apenas para teste
                        </p>
                    </div>
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Checkout Teste</h1>
                    <p className={styles.subtitle}>Gut Reset - Teste de Pagamento</p>
                </div>

                {/* Order Summary */}
                <div className={styles.orderSummary}>
                    <h3>Resumo do Pedido (TESTE)</h3>
                    <div className={styles.orderItem}>
                        <span>Pagamento de Teste</span>
                        <span className={styles.price}>R$ 5,00</span>
                    </div>
                    <div className={styles.orderTotal}>
                        <span>Total</span>
                        <span>R$ 5,00</span>
                    </div>
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
                                        'Gerar QR Code PIX (R$ 5,00)'
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
                                    <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '1rem' }}>
                                        Verificando pagamento automaticamente...
                                    </p>
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
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <><Loader2 size={20} className={styles.spinner} /> Processando...</>
                                ) : (
                                    'Pagar R$ 5,00 (Teste)'
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
                    <p className={styles.disclaimer}>Página de teste - Valor real: R$ 5,00</p>
                </div>
            </motion.div>
        </main>
    );
}
