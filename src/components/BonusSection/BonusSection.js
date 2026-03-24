'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import styles from './BonusSection.module.css';

function useCountdown(targetHours) {
    const [timeLeft, setTimeLeft] = useState({ hours: targetHours, minutes: 0, seconds: 0 });

    useEffect(() => {
        // For a demonstration, we'll start a 24h countdown from the first render
        // In a real app, this might be based on a session or a fixed date
        let totalSeconds = targetHours * 3600;

        const timer = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds -= 1;
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                setTimeLeft({ hours: h, minutes: m, seconds: s });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetHours]);

    return timeLeft;
}

export default function BonusSection() {
    const countdown = useCountdown(24);

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
