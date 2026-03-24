'use client';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';
import { Dumbbell, UserRoundCheck, Percent } from 'lucide-react';
import styles from './NovidadesSection.module.css';

const novidades = [
    {
        icon: Dumbbell,
        image: "/IMG_1026.png",
        title: "Plano de treinos exclusivo",
        description: "Desenvolvido junto com a minha educadora física, Aline Oliveira, para potencializar ainda mais seus resultados."
    },
    {
        icon: UserRoundCheck,
        image: "/IMG_1027.JPEG",
        title: "Suporte com a Dra. Michelle",
        description: "Especialista em saúde metabólica, trazendo orientações importantes durante todo o processo."
    },
    {
        icon: Percent,
        title: "Desconto em Consulta",
        description: "Para quem quiser investigar sua saúde de forma profunda, terá 10% de desconto na consulta com a Dra. Michelle."
    }
];

export default function NovidadesSection() {
    const treinos = novidades[0];
    const suporte = novidades[1];
    const desconto = novidades[2];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <motion.div 
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className={styles.label}>O QUE HÁ DE NOVO</span>
                    <h2 className={styles.title}>Novidades da Turma 3</h2>
                    <p className={styles.subtitle}>Esta é a versão mais completa já construída do Gut Reset.</p>
                </motion.div>

                <div className={styles.stack}>
                    {/* Aline Oliveira Row (Image Left, Text Right) */}
                    <motion.div 
                        className={styles.row}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={styles.imageColumn}>
                            <img src={treinos.image} alt={treinos.title} className={styles.largeImage} />
                        </div>
                        <div className={styles.textColumn}>
                            <div className={styles.iconWrapper}>
                                <treinos.icon size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className={styles.rowTitle}>{treinos.title}</h3>
                            <p className={styles.rowText}>{treinos.description}</p>
                        </div>
                    </motion.div>

                    {/* Dra. Michelle Row (Text Left, Image Right) */}
                    <motion.div 
                        className={`${styles.row} ${styles.reverse}`}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={styles.imageColumn}>
                            <img src={suporte.image} alt={suporte.title} className={styles.largeImage} />
                        </div>
                        <div className={styles.textColumn}>
                            <div className={styles.iconWrapper}>
                                <suporte.icon size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className={styles.rowTitle}>{suporte.title}</h3>
                            <p className={styles.rowText}>{suporte.description}</p>
                        </div>
                    </motion.div>

                    {/* Discount Centered */}
                    <motion.div 
                        className={styles.centeredBox}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className={styles.discountCard}>
                            <div className={styles.iconWrapperCenter}>
                                <desconto.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className={styles.discountTitle}>{desconto.title}</h3>
                            <p className={styles.discountText}>{desconto.description}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
