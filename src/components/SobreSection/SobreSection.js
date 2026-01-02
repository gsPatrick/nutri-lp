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
                            src="/nutri.png"
                            alt="Nutricionista Profissional"
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
                                Se você vive <span className={styles.highlight}>estufada, cansada, travada no emagrecimento</span> e com a sensação de que "nada muda", é o seu intestino pedindo ajuda.
                            </p>
                            <br />
                            <p>
                                Um intestino inflamado impede seus resultados. O Gut Reset foi desenhado para reorganizar o corpo e fazer ele voltar a responder.
                            </p>
                        </div>
                        <div className={styles.signature}>Gut Reset</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
