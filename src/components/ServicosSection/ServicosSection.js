'use client';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/animations';
import styles from './ServicosSection.module.css';

const deliverables = [
    {
        id: "01",
        title: "Protocolo 15 Dias",
        description: "Passo a passo completo e estratégico para reorganizar seu corpo."
    },
    {
        id: "02",
        title: "Plano Alimentar",
        description: "Estratégia alimentar focada em desinflamação e resultados reais."
    },
    {
        id: "03",
        title: "Treinos Exclusivos",
        description: "Plano desenvolvido para potencializar a queima e a energia."
    },
    {
        id: "04",
        title: "Suporte Especializado",
        description: "Acompanhamento e orientações durante todo o processo de 15 dias."
    },
    {
        id: "05",
        title: "2 Calls de Grupo",
        description: "Mentorias ao vivo para alinhamento, dúvidas e acompanhamento."
    },
    {
        id: "06",
        title: "Bônus E-book",
        description: "Guia prático: Como interpretar seus exames do jeito certo (24h)."
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
