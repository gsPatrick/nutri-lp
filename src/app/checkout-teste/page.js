'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Shield, Copy, CheckCircle, Loader2, Check } from 'lucide-react';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geral-api-gut-reset.r954jc.easypanel.host';

const benefits = [
    "PAGAMENTO DE TESTE (R$ 15,00)",
    "Protocolo completo de 15 dias",
    "Plano alimentar estratégico",
    "Treinos exclusivos (Aline Oliveira)",
    "Suporte com Dra. Michelle",
    "2 Calls de grupo ao vivo",
    "Bônus: E-book exclusivo (exames)"
];

export default function CheckoutTestePage() {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pixCopied, setPixCopied] = useState(false);
    const [error, setError] = useState('');

    // Product config fixed for TEST (R$ 15,00)
    const [productConfig, setProductConfig] = useState({
        productPrice: 15,
        productName: 'TESTE - Protocolo Gut Reset',
        maxInstallments: 3, // 15 / 5 = 3
        installmentOptions: [
            { installments: 1, value: 15, label: '1x de R$ 15,00 (à vista)' },
            { installments: 2, value: 7.5, label: '2x de R$ 7,50 sem juros' },
            { installments: 3, value: 5, label: '3x de R$ 5,00 sem juros' }
        ]
    });

    // PIX payment data
    const [pixData, setPixData] = useState(null);
    const [pixPaymentId, setPixPaymentId] = useState(null);

    // Customer data
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        cpfCnpj: '',
        phone: '',
        postalCode: '',
        addressNumber: ''
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

    const formatPrice = (value) => {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleCustomerChange = (e) => {
        let { name, value } = e.target;

        // Mask for CPF/CNPJ
        if (name === 'cpfCnpj') {
            value = value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            } else {
                value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
            }
        }

        // Mask for Phone
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 11);
            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
            } else if (value.length > 5) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
            }
        }

        // Mask for PostalCode
        if (name === 'postalCode') {
            value = value.replace(/\D/g, '').slice(0, 8);
            value = value.replace(/(\d{5})(\d{3})/, "$1-$2");
        }

        setCustomer({ ...customer, [name]: value });
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
                value = value.slice(0, 2) + (value.length > 2 ? '/' + value.slice(2) : '');
            }
            
            const [month, year] = value.split('/');
            setCardData(prev => ({
                ...prev,
                expiry: value,
                expiryMonth: month || '',
                expiryYear: year && year.length === 2 ? `20${year}` : (year && year.length === 4 ? year : '')
            }));
            return;
        }

        setCardData({ ...cardData, [e.target.name]: value });
    };

    const validateCustomer = () => {
        if (!customer.name || !customer.email || !customer.cpfCnpj || !customer.phone || !customer.postalCode || !customer.addressNumber) {
            setError('Preencha todos os dados (incluindo telefone e endereço)');
            return false;
        }
        const cpf = customer.cpfCnpj.replace(/\D/g, '');
        if (cpf.length !== 11 && cpf.length !== 14) {
            setError('CPF/CNPJ inválido');
            return false;
        }
        const cep = customer.postalCode.replace(/\D/g, '');
        if (cep.length !== 8) {
            setError('CEP inválido');
            return false;
        }
        setError('');
        return true;
    };

    const handleGeneratePix = async () => {
        if (!validateCustomer()) return;
        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/payments/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    customer: {
                        ...customer,
                        phone: customer.phone.replace(/\D/g, ''),
                        cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''),
                        postalCode: customer.postalCode.replace(/\D/g, ''),
                        addressNumber: customer.addressNumber.replace(/[^\d\w\s]/g, '')
                    },
                    testMode: true,
                    price: 15
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao gerar PIX');

            setPixData(data.pix);
            setPixPaymentId(data.paymentId);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (!pixPaymentId) return;
        const checkStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/payments/${pixPaymentId}/status`);
                const data = await response.json();
                if (data.confirmed) router.push(`/sucesso?email=${encodeURIComponent(customer.email)}`);
            } catch (err) { console.error(err); }
        };
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [pixPaymentId, router, customer.email]);

    const handlePixCopy = () => {
        if (pixData?.copyPaste) {
            navigator.clipboard.writeText(pixData.copyPaste);
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        }
    };

    const handleCheckPixPayment = async () => {
        if (!pixPaymentId) return;
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_URL}/api/payments/${pixPaymentId}/status`);
            const data = await response.json();
            if (data.confirmed) {
                router.push(`/sucesso?email=${encodeURIComponent(customer.email)}`);
            } else {
                setError('Pagamento ainda não confirmado.');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) { setError('Erro ao verificar'); }
        finally { setIsProcessing(false); }
    };

    const handleCardPayment = async (e) => {
        e.preventDefault();
        if (!validateCustomer()) return;
        if (!cardData.number || !cardData.holderName || !cardData.expiryMonth || !cardData.cvv) {
            setError('Preencha os dados do cartão');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/payments/card`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: {
                        ...customer,
                        phone: customer.phone.replace(/\D/g, ''),
                        cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''),
                        postalCode: customer.postalCode.replace(/\D/g, ''),
                        addressNumber: customer.addressNumber.replace(/[^\d\w\s]/g, '')
                    },
                    card: {
                        number: cardData.number.replace(/\s/g, ''),
                        holderName: cardData.holderName.toUpperCase(),
                        expiryMonth: cardData.expiryMonth,
                        expiryYear: cardData.expiryYear,
                        ccv: cardData.cvv
                    },
                    installments,
                    testMode: true,
                    price: 15
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erro ao processar');
            router.push(`/sucesso?email=${encodeURIComponent(customer.email)}`);
        } catch (err) {
            console.error(err);
            setError(`Ocorreu um erro: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.layout}>
                <motion.div
                    className={styles.container}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={styles.header}>
                        <p className={styles.subtitle} style={{ color: '#ff6b6b' }}>PÁGINA DE TESTE (R$ 15,00)</p>
                        <h1 className={styles.title}>Checkout Teste</h1>
                    </div>

                    <div className={styles.orderSummary}>
                        <h3>Resumo do Teste</h3>
                        <div className={styles.orderItem}>
                            <span>{productConfig.productName}</span>
                            <span className={styles.price}>R$ 15,00</span>
                        </div>
                        <div className={styles.orderTotal}>
                            <span>Total</span>
                            <span>R$ 15,00</span>
                        </div>
                    </div>

                    <div className={styles.customerSection}>
                        <h3>Seus Dados</h3>
                        <div className={styles.formGroup}><input type="text" name="name" placeholder="Nome completo" value={customer.name} onChange={handleCustomerChange} required /></div>
                        <div className={styles.formGroup}><input type="email" name="email" placeholder="E-mail" value={customer.email} onChange={handleCustomerChange} required /></div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}><input type="text" name="cpfCnpj" placeholder="CPF" value={customer.cpfCnpj} onChange={handleCustomerChange} maxLength={14} required /></div>
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Telefone / WhatsApp *</label>
                                <input type="text" name="phone" placeholder="(00) 00000-0000" value={customer.phone} onChange={handleCustomerChange} required />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>CEP</label>
                                <input type="text" name="postalCode" placeholder="00000-000" value={customer.postalCode} onChange={handleCustomerChange} maxLength={9} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Nº</label>
                                <input type="text" name="addressNumber" placeholder="Ex: 123" value={customer.addressNumber} onChange={handleCustomerChange} required />
                            </div>
                        </div>
                    </div>

                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${paymentMethod === 'pix' ? styles.active : ''}`} onClick={() => { setPaymentMethod('pix'); setPixData(null); }}><QrCode size={20} /> PIX</button>
                        <button className={`${styles.tab} ${paymentMethod === 'card' ? styles.active : ''}`} onClick={() => setPaymentMethod('card')}><CreditCard size={20} /> Cartão</button>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.paymentContent}>
                        {paymentMethod === 'pix' ? (
                            <div className={styles.pixSection}>
                                {!pixData ? (
                                    <button className={styles.submitButton} onClick={handleGeneratePix} disabled={isProcessing}>{isProcessing ? <Loader2 size={20} className={styles.spinner} /> : 'Gerar R$ 15,00'}</button>
                                ) : (
                                    <>
                                        <div className={styles.qrCode}><img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code" className={styles.qrImage} /></div>
                                        <button className={styles.copyButton} onClick={handlePixCopy}>{pixCopied ? 'Copiado!' : 'Copiar PIX'}</button>
                                        <button className={styles.submitButton} onClick={handleCheckPixPayment}>Já paguei (R$ 15,00)</button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <form className={styles.cardForm} onSubmit={handleCardPayment}>
                                <div className={styles.formGroup}><label>Cartão</label><input type="text" name="number" placeholder="0000 0000 0000 0000" value={cardData.number} onChange={handleCardChange} maxLength={19} required /></div>
                                <div className={styles.formGroup}><label>Nome</label><input type="text" name="holderName" placeholder="NOME" value={cardData.holderName} onChange={handleCardChange} required /></div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}><label>Validade</label><input type="text" name="expiry" placeholder="MM/AA" value={cardData.expiry || ''} onChange={handleCardChange} maxLength={5} required /></div>
                                    <div className={styles.formGroup}><label>CVV</label><input type="text" name="cvv" placeholder="123" value={cardData.cvv} onChange={handleCardChange} maxLength={4} required /></div>
                                </div>
                                <button type="submit" className={styles.submitButton} disabled={isProcessing}>Pagar R$ 15,00</button>
                            </form>
                        )}
                    </div>
                </motion.div>

                <motion.div className={styles.benefitsSidebar} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <div className={styles.benefitsContent}>
                        <h3 className={styles.benefitsTitle}>Teste de Compra:</h3>
                        <ul className={styles.benefitsList}>
                            {benefits.map((b, i) => (<li key={i} className={styles.benefitItem}><Check size={18} className={styles.checkIcon} /><span>{b}</span></li>))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
