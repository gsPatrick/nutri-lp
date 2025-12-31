'use client';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';
import styles from './ServicosSection.module.css';

const deliverables = [
    {
        id: "01",
        title: "Protocolo 15 Dias",
        description: "Um passo a passo completo para reorganizar seu funcionamento intestinal."
    },
    {
        id: "02",
        title: "2 Calls de Alinhamento",
        description: "Mentoria direta para tirar dúvidas e ajustar a rota (Incluso!)."
    },
    {
        id: "03",
        title: "Plano Anti-inflamatório",
        description: "Cardápios e estratégias alimentares focadas em desinflamação."
    },
    {
        id: "04",
        title: "Grupo Exclusivo",
        description: "Acesso ao grupo VIP para suporte e motivação diária."
    },
    {
        id: "05",
        title: "Estratégias Diárias",
        description: "Digestão, sono e rotina otimizados para resultados rápidos."
    },
    {
        id: "06",
        title: "Pós-Reset",
        description: "Orientações claras de como seguir após os 15 dias."
    }
];

export default function ServicosSection() {
    return (
        <section className={styles.section} id="servicos">
            <div className={styles.container}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    O que você vai receber
                </motion.h2>

                <motion.div
                    className={styles.grid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {deliverables.map((item) => (
                        <motion.div key={item.id} className={styles.card} variants={fadeUp}>
                            <div className={styles.cardHeader}>
                                <span className={styles.number}>{item.id}</span>
                            </div>
                            <h3 className={styles.title}>{item.title}</h3>
                            <p className={styles.description}>{item.description}</p>
                            <div className={styles.line}></div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
