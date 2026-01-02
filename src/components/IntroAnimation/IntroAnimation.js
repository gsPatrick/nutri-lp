'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './IntroAnimation.module.css';

export default function IntroAnimation({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Total animation time approx 3.5s
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 3800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <motion.div
            className={styles.overlay}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.8, delay: 3, ease: 'easeInOut' }}
        >
            <div className={styles.content}>
                {/* Stage 1: Small Greeting */}
                <motion.p
                    className={styles.greeting}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Bem-vinda ao
                </motion.p>

                {/* Stage 2: Big Title Reveal */}
                <div className={styles.titleWrapper}>
                    <motion.h1
                        className={styles.title}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        GUT RESET
                    </motion.h1>
                    <motion.div
                        className={styles.line}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 1.5, ease: 'easeInOut' }}
                    />
                </div>

                {/* Stage 3: Tagline */}
                <motion.p
                    className={styles.tagline}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 2 }}
                >
                    Protocolo Exclusivo Gut Reset
                </motion.p>
            </div>

            {/* Curtain Effect */}
            <motion.div
                className={styles.curtain}
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 1, delay: 3, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 0 }}
            />
        </motion.div>
    );
}
