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

export default function DepoimentosSection({ images = [] }) {
    // If no images provided, fallback to placeholders or show empty state
    // But for better UX, if empty, we might assume user hasn't uploaded yet.
    // Let's create a safe array. If empty, maybe show 1-2 generic placeholders or nothing.
    const hasImages = images.length > 0;

    // Duplicate images for infinite loop effect (at least 4x to fill width if few images)
    const displayImages = hasImages
        ? [...images, ...images, ...images, ...images]
        : [];

    return (
        <section className={styles.section} id="depoimentos">
            <div className={styles.header}>
                <h2 className={styles.title}>Resultados Reais</h2>
                <p className={styles.subtitle}>Junte-se a centenas de vidas transformadas.</p>
            </div>

            {hasImages ? (
                <>
                    <div className={styles.marqueeContainer}>
                        {/* Track 1 - Moving Left */}
                        <div className={styles.marqueeTrack}>
                            {displayImages.map((src, idx) => (
                                <div key={`t1-${idx}`} className={styles.imageCard}>
                                    <img src={src} alt={`Depoimento ${idx}`} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.marqueeContainer} style={{ marginTop: '2rem' }}>
                        {/* Track 2 - Moving Right (Reverse) */}
                        {/* For visual variety, we can reverse the array or offset it */}
                        <div className={`${styles.marqueeTrack} ${styles.reverse}`}>
                            {[...displayImages].reverse().map((src, idx) => (
                                <div key={`t2-${idx}`} className={styles.imageCard}>
                                    <img src={src} alt={`Depoimento ${idx}`} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.emptyState}>
                    <p>Adicione imagens na pasta <code>public/depoimentos</code> para vê-las aqui.</p>
                </div>
            )}

        </section>
    );
}
