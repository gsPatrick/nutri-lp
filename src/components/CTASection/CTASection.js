'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Clock, Users } from 'lucide-react';
import styles from './CTASection.module.css';

const features = [
    "Protocolo completo de 15 dias",
    "2 Calls de alinhamento ao vivo",
    "Grupo VIP exclusivo no WhatsApp",
    "Plano alimentar personalizado",
    "Suporte direto comigo"
];

// Countdown Target: 12/01/2026 (Updated per request)
const targetDate = new Date('2026-01-12T00:00:00');

function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
}

export default function CTASection() {
    const countdown = useCountdown(targetDate);

    return (
        <section className={styles.ctaSection} id="contato">
            {/* Background Glow */}
            <div className={styles.bgGlow}></div>

            <div className={styles.container}>
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Urgency Badge */}
                    <div className={styles.urgencyBadge}>
                        <Clock size={16} />
                        <span>INSCRIÇÕES ENCERRAM EM BREVE</span>
                    </div>

                    {/* Target Date Display */}
                    <p className={styles.targetDate}>Próxima turma inicia em <strong>12/01</strong></p>

                    {/* Countdown Timer */}
                    <div className={styles.countdownContainer}>
                        <div className={styles.countdownBox}>
                            <span className={styles.countdownNumber}>{String(countdown.days).padStart(2, '0')}</span>
                            <span className={styles.countdownLabel}>Dias</span>
                        </div>
                        <span className={styles.countdownSeparator}>:</span>
                        <div className={styles.countdownBox}>
                            <span className={styles.countdownNumber}>{String(countdown.hours).padStart(2, '0')}</span>
                            <span className={styles.countdownLabel}>Horas</span>
                        </div>
                        <span className={styles.countdownSeparator}>:</span>
                        <div className={styles.countdownBox}>
                            <span className={styles.countdownNumber}>{String(countdown.minutes).padStart(2, '0')}</span>
                            <span className={styles.countdownLabel}>Min</span>
                        </div>
                        <span className={styles.countdownSeparator}>:</span>
                        <div className={styles.countdownBox}>
                            <span className={styles.countdownNumber}>{String(countdown.seconds).padStart(2, '0')}</span>
                            <span className={styles.countdownLabel}>Seg</span>
                        </div>
                    </div>

                    <h2 className={styles.headline}>
                        Pronta para transformar<br />
                        <span className={styles.highlight}>sua relação com o seu corpo?</span>
                    </h2>

                    <p className={styles.subheadline}>
                        Garanta sua vaga e dê o primeiro passo para uma vida mais leve.
                    </p>

                    {/* Pricing Card */}
                    <div className={styles.pricingCard}>
                        <div className={styles.pricingHeader}>
                            <p className={styles.oldPrice}>De R$ 1.700,00</p>
                            <p className={styles.discount}>-83% OFF</p>
                        </div>
                        <p className={styles.newPrice}>
                            <span className={styles.currency}>R$</span>
                            <span className={styles.amount}>289</span>
                            <span className={styles.cents}>,00</span>
                        </p>
                        <p className={styles.paymentNote}>(em até 6x de R$ 48,17 sem juros)</p>

                        {/* Feature List */}
                        <ul className={styles.featureList}>
                            {features.map((feature, idx) => (
                                <li key={idx}>
                                    <Check size={18} className={styles.checkIcon} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Refund Note */}
                        <p className={styles.refundNote}>Produto sem reembolso</p>

                        <a href="/checkout" className={styles.ctaBtn}>
                            Garantir Minha Vaga Agora
                        </a>

                        {/* Trust Badges */}
                        <div className={styles.trustBadges}>
                            <div className={styles.badge}>
                                <Shield size={20} />
                                <span>Compra Segura</span>
                            </div>
                            <div className={styles.badge}>
                                <Users size={20} />
                                <span>+500 alunas</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
