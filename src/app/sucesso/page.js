'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Heart, Zap, Download } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './page.module.css';

export default function SucessoPage() {
    const whatsappGroupLink = 'https://chat.whatsapp.com/KsuQk8YplktL6ovX2OgY6t';
    const pdfUrl = '/PROTOCOLO - GUT RESET.pdf';

    return (
        <main className={styles.main}>
            <motion.div
                className={styles.container}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Success Badge */}
                <motion.div
                    className={styles.successBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <CheckCircle size={36} strokeWidth={2} />
                </motion.div>

                {/* Message */}
                <motion.h1
                    className={styles.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Parabéns! 🎉
                </motion.h1>

                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Seu pagamento foi confirmado!
                </motion.p>

                {/* Flashing Warning Message */}
                <motion.div
                    className={styles.warningBox}
                    animate={{
                        boxShadow: ["0 0 0 0 rgba(255, 200, 0, 0)", "0 0 20px 5px rgba(255, 200, 0, 0.5)", "0 0 0 0 rgba(255, 200, 0, 0)"]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                >
                    <p>⚠️ IMPORTANTE ⚠️</p>
                    <p>Você <strong>PRECISA</strong> clicar nos botões abaixo para entrar no grupo e baixar seu material!</p>
                </motion.div>

                {/* Benefits mini list */}
                <motion.div
                    className={styles.benefits}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className={styles.benefitItem}>
                        <Sparkles size={16} />
                        <span>Acesso imediato ao grupo VIP</span>
                    </div>
                    <div className={styles.benefitItem}>
                        <Heart size={16} />
                        <span>Suporte direto com a nutricionista</span>
                    </div>
                    <div className={styles.benefitItem}>
                        <Zap size={16} />
                        <span>Protocolo completo de 15 dias</span>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className={styles.actions}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {/* WhatsApp Button */}
                    <motion.a
                        href={whatsappGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsappButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaWhatsapp size={22} />
                        <span>Entrar no Grupo VIP</span>
                    </motion.a>

                    {/* PDF Download Button */}
                    <motion.a
                        href={pdfUrl}
                        download="Protocolo-Gut-Reset.pdf"
                        className={styles.downloadButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Download size={20} />
                        <span>Baixar Protocolo PDF</span>
                    </motion.a>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    className={styles.note}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    Entre no grupo para suporte e baixe o PDF com o protocolo completo
                </motion.p>
            </motion.div>
        </main>
    );
}
