'use client';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            {/* Multi-Layer Wave Divider - SVG */}
            <div className={styles.waveWrapper}>
                <svg
                    viewBox="0 0 1440 200"
                    preserveAspectRatio="none"
                    className={styles.waveSvg}
                >
                    {/* Back wave - Lightest Green */}
                    <path
                        d="M0,100 C360,200 720,0 1080,100 C1260,150 1440,80 1440,80 L1440,200 L0,200 Z"
                        fill="#3d9970"
                        opacity="0.6"
                    />
                    {/* Middle wave - Medium Green */}
                    <path
                        d="M0,120 C300,180 600,60 900,120 C1150,160 1300,100 1440,110 L1440,200 L0,200 Z"
                        fill="#2E8B6A"
                        opacity="0.8"
                    />
                    {/* Front wave - Dark Green (main CTA color) */}
                    <path
                        d="M0,140 C240,180 480,100 720,140 C960,180 1200,120 1440,150 L1440,200 L0,200 Z"
                        fill="#1a3c2f"
                    />
                </svg>
            </div>

            <div className={styles.container}>
                {/* Large GUT RESET Typography */}
                <h2 className={styles.hugeTitle}>GUT RESET</h2>

                {/* Nutritionist Name */}
                <p className={styles.signature}>Por Gut Reset</p>

                {/* Copyright */}
                <p className={styles.copyright}>
                    © {currentYear} Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
