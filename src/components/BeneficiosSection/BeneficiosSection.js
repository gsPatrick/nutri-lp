'use client';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { ArrowRight, Star, Heart, Activity, Zap, Brain, Scale } from 'lucide-react';
import styles from './BeneficiosSection.module.css';

const features = [
    {
        icon: Scale,
        title: "Reduzir Inchaço",
        text: "Elimine a sensação de estufamento e desconforto abdominal.",
        size: "large"
    },
    {
        icon: Brain,
        title: "Eixo Intestino-Cérebro",
        text: "Regule seu humor e diminua a ansiedade tratando a raiz.",
        size: "small"
    },
    {
        icon: Zap,
        title: "Energia Real",
        text: "Chega de viver cansada. Recupere sua disposição no dia a dia.",
        size: "small"
    },
    {
        icon: Activity,
        title: "Nutrição Eficiente",
        text: "Melhore a absorção de nutrientes vital para sua saúde.",
        size: "medium"
    },
    {
        icon: ArrowRight,
        title: "Destravar Peso",
        text: "Quando a inflamação diminui, o emagrecimento acontece naturalmente.",
        size: "small"
    }
];

export default function BeneficiosSection() {
    return (
        <section className={styles.section} id="beneficios">
            <div className={styles.container}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className={styles.label}>O RESULTADO</span>
                    <h2 className={styles.title}>O Gut Reset vai te ajudar a:</h2>
                </motion.div>

                <motion.div
                    className={styles.grid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            className={`${styles.card} ${styles[feature.size] || ''}`}
                            variants={fadeUp}
                        >
                            <div className={styles.iconWrapper}>
                                <feature.icon size={32} strokeWidth={1} />
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardText}>{feature.text}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
