'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './DepoimentosSection.module.css';

// Using Unsplash placeholders to simulate 20 images
const images = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    src: `https://images.unsplash.com/photo-${1500000000000 + i * 10000}?auto=format&fit=crop&w=400&q=80`
    // Randomized diverse people/lifestyle shots would be better, but generic IDs for now.
    // Using specific IDs for stability if needed, but random is okay for placeholder logic.
}));

/* 
  Ideally user would replace these with real screenshot/photo URLs. 
  For now, we duplicate the array to create a seamless loop effect manually or use CSS animation.
  CSS Animation is smoother for infinite marquees.
*/

export default function DepoimentosSection() {
    return (
        <section className={styles.section} id="depoimentos">
            <div className={styles.header}>
                <h2 className={styles.title}>Resultados Reais</h2>
                <p className={styles.subtitle}>Junte-se a centenas de vidas transformadas.</p>
            </div>

            <div className={styles.marqueeContainer}>
                {/* Track 1 - Moving Left */}
                <div className={styles.marqueeTrack}>
                    {/* Duplicate 3 times for seamless loop */}
                    {[...images, ...images, ...images].map((img, idx) => (
                        <div key={`t1-${idx}`} className={styles.imageCard}>
                            <div className={styles.placeholder}>
                                <span className={styles.placeholderText}>Resultado #{idx + 1}</span>
                            </div>
                            {/* <img src={img.src} alt="Depoimento" /> */}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.marqueeContainer} style={{ marginTop: '2rem' }}>
                {/* Track 2 - Moving Right (Optional or same direction) */}
                <div className={`${styles.marqueeTrack} ${styles.reverse}`}>
                    {[...images, ...images, ...images].map((img, idx) => (
                        <div key={`t2-${idx}`} className={styles.imageCard}>
                            <div className={styles.placeholder} style={{ background: '#f0f0f0' }}>
                                <span className={styles.placeholderText}>Depoimento #{idx + 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}
