'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

const navLinks = [
    { name: 'Sobre', href: '#sobre' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Depoimentos', href: '#depoimentos' },
    { name: 'Contato', href: '#contato' },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <div className={styles.container}>
                <div className={styles.logo}>
                    Gut<span className={styles.highlight}>Reset</span>
                </div>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        {navLinks.map((link) => (
                            <li key={link.name} className={styles.navItem}>
                                <a href={link.href} className={styles.navLink}>{link.name}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <a href="/checkout" className={styles.ctaButton}>Garantir Vaga</a>
            </div>
        </motion.header>
    );
}
