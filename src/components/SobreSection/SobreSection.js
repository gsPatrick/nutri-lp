'use client';
import { motion } from 'framer-motion';
import styles from './SobreSection.module.css';

export default function SobreSection() {
    return (
        <section className={styles.section} id="sobre">
            <div className={styles.grid}>
                {/* Image Side */}
                <motion.div
                    className={styles.imageColumn}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.imageWrapper}>
                        {/* Clean image without complex parallax container that might cut it off */}
                        <img
                            src="/sobre-michelle.jpeg"
                            alt="Sobre Dra. Michelle"
                            className={styles.image}
                        />
                    </div>
                </motion.div>

                {/* Text Side */}
                <motion.div
                    className={styles.textColumn}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className={styles.contentBox}>
                        <h2 className={styles.heading}>Seu corpo está pedindo <span className={styles.italic}>socorro?</span></h2>
                        <div className={styles.separator}></div>
                        <div className={styles.text}>
                            <p>
                                Você pode até estar tentando fazer tudo certo mas se o seu intestino não está funcionando bem, o seu corpo não responde.
                            </p>
                            
                            <ul className={styles.symptomsList}>
                                <li><span>•</span> a barriga incha</li>
                                <li><span>•</span> a energia oscila</li>
                                <li><span>•</span> o humor muda</li>
                                <li><span>•</span> o emagrecimento trava</li>
                            </ul>

                            <p>
                                O Gut Reset é um protocolo de 15 dias focado em reorganizar o corpo e fazer ele voltar a responder. Porque quando o intestino funciona bem, você sente a diferença no corpo inteiro.
                            </p>
                        </div>
                        <div className={styles.signature}>Gut Reset</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
