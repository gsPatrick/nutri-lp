'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Clock, Users } from 'lucide-react';
import styles from './CTASection.module.css';

const features = [
    "Protocolo completo de 15 dias",
    "Plano alimentar estratégico",
    "Estratégias digestivas diárias",
    "Plano de treinos exclusivo",
    "Suporte durante todo o processo",
    "Bônus: E-book exclusivo (24h)"
];

// Countdown Target: 05/04/2026 (Registration deadline)
const targetDate = new Date('2026-04-05T23:59:59');

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
                        <span>INSCRIÇÕES ABERTAS - VAGAS LIMITADAS</span>
                    </div>

                    {/* Target Date Display */}
                    <p className={styles.targetDate}>Próxima turma inicia em <strong>13/04</strong></p>

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

                    {/* Refund Policy Note */}
                    <p className={styles.refundPolicy}>
                        Após a confirmação da compra, não será possível solicitar reembolso, devido ao acesso imediato ao conteúdo.
                    </p>

                    <h2 className={styles.headline}>
                        Sua transformação começa<br />
                        <span className={styles.highlight}>quando você decide agir.</span>
                    </h2>

                    <p className={styles.subheadline}>
                        Garanta sua vaga na Turma 3 e comece a sentir a diferença no corpo inteiro.
                    </p>

                    {/* Pricing Card */}
                    <div className={styles.pricingCard}>
                        <div className={styles.pricingHeader}>
                            <p className={styles.oldPrice}>De R$ 1.700,00</p>
                            <p className={styles.discount}>LOTE ESPECIAL</p>
                        </div>
                        <p className={styles.newPrice}>
                            <span className={styles.currency}>R$</span>
                            <span className={styles.amount}>389</span>
                            <span className={styles.cents}>,00</span>
                        </p>
                        <p className={styles.paymentNote}>(em até 6x de R$ 64,83 sem juros)</p>

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
                        <p className={styles.refundNote}>Começamos juntas no dia 13/04</p>

                        <a href="/checkout" className={styles.ctaBtn}>
                            Garantir Minha Vaga Agora
                        </a>

                        <p className={styles.minimalistRefund}>
                            *Após a confirmação da compra, não será possível solicitar reembolso, devido ao acesso imediato ao conteúdo.
                        </p>

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
