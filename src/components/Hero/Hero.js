'use client';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/animations';
import CanvasBackground from '../CanvasBackground/CanvasBackground';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <CanvasBackground />

            {/* Background Layers */}
            <div className={styles.bgSolid}></div>
            <div className={styles.bgGradient}></div>

            {/* Main Layout */}
            <div className={styles.magazineContainer}>

                {/* Text Layer - Behind Subject? Or Beside? 
                    "Magazine Cover" usually has title BEHIND head. 
                    Let's try Title Behind, but readable.
                */}
                <div className={styles.titleWrapper}>
                    <motion.h1
                        className={styles.hugeTitle}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        GUT RESET
                    </motion.h1>
                </div>

                {/* Subject Image - Cutout */}
                <motion.div
                    className={styles.imageWrapper}
                    initial={{ opacity: 0, scale: 1.1, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <img src="/hero.png" alt="Nutricionista" className={styles.heroImage} />
                </motion.div>

                {/* Content Layer - Floating Cards/Text */}
                <div className={styles.contentLayer}>
                    <motion.div
                        className={styles.floatingContent}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        <p className={styles.subtitle}>
                            15 dias para destravar seu<br />
                            emagrecimento e devolver<br />
                            sua energia vital.
                        </p>
                        <a href="#contato" className={styles.ctaButton}>
                            Entrar no Grupo VIP
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
