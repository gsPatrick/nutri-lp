'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import styles from './BonusSection.module.css';

function useCountdown(targetDateStr) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const target = new Date(targetDateStr).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference > 0) {
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + Math.floor(difference / (1000 * 60 * 60 * 24)) * 24; // Show total remaining hours even if > 24
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [targetDateStr]);

    return timeLeft;
}

export default function BonusSection() {
    const countdown = useCountdown('2026-04-01T23:59:59-03:00');

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <motion.div 
                        className={styles.imageBox}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.ebookMural}>
                            <BookOpen size={80} strokeWidth={1} />
                            <span>E-BOOK EXCLUSIVO</span>
                        </div>
                    </motion.div>

                    <motion.div 
                        className={styles.textBox}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className={styles.label}>BÔNUS EXCLUSIVO</span>
                        <h2 className={styles.title}>Como interpretar seus exames do jeito certo</h2>
                        <p className={styles.description}>
                            Muito além do “dentro da referência”, existe um corpo tentando te dar sinais. 
                            Você vai aprender a entender o que seus exames dizem sobre metabolismo, intestino, 
                            inflamação e saúde como um todo.
                        </p>

                        <div className={styles.timerWrapper}>
                            <div className={styles.timerHeader}>
                                <Clock size={18} />
                                <span>VÁLIDO SOMENTE NAS PRIMEIRAS 24H</span>
                            </div>
                            <div className={styles.timerGrid}>
                                <div className={styles.timerItem}>
                                    <span className={styles.timerValue}>{String(countdown.hours).padStart(2, '0')}</span>
                                    <span className={styles.timerLabel}>Horas</span>
                                </div>
                                <span className={styles.timerSeparator}>:</span>
                                <div className={styles.timerItem}>
                                    <span className={styles.timerValue}>{String(countdown.minutes).padStart(2, '0')}</span>
                                    <span className={styles.timerLabel}>Minutos</span>
                                </div>
                                <span className={styles.timerSeparator}>:</span>
                                <div className={styles.timerItem}>
                                    <span className={styles.timerValue}>{String(countdown.seconds).padStart(2, '0')}</span>
                                    <span className={styles.timerLabel}>Segundos</span>
                                </div>
                            </div>
                        </div>

                        <a href="/checkout" className={styles.ctaButton}>
                            Garantir meu bônus
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
