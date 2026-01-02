'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Download, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SucessoPage() {
    // Simulated PDF download URL - replace with real link later
    const pdfUrl = '/protocolo-gut-reset.pdf';

    const handleDownload = () => {
        // Simulate download - in production this would be a real PDF
        alert('PDF simulado! Na versão final, o download será real.');
        // window.open(pdfUrl, '_blank');
    };

    return (
        <main className={styles.main}>
            <motion.div
                className={styles.container}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Success Icon */}
                <motion.div
                    className={styles.iconWrapper}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                    <CheckCircle size={80} strokeWidth={1.5} />
                </motion.div>

                {/* Success Message */}
                <motion.h1
                    className={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Pagamento Confirmado!
                </motion.h1>

                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    Bem-vinda ao Gut Reset! Seu acesso está liberado.
                </motion.p>

                {/* Download Card */}
                <motion.div
                    className={styles.downloadCard}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className={styles.cardIcon}>
                        <FileText size={40} strokeWidth={1.5} />
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Protocolo Gut Reset</h3>
                        <p>PDF com seu plano completo de 15 dias</p>
                    </div>
                    <button className={styles.downloadButton} onClick={handleDownload}>
                        <Download size={20} />
                        Baixar PDF
                    </button>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                    className={styles.nextSteps}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <h4>Próximos Passos:</h4>
                    <ul>
                        <li><ArrowRight size={16} /> Baixe o PDF do protocolo</li>
                        <li><ArrowRight size={16} /> Acesse o grupo VIP no WhatsApp</li>
                        <li><ArrowRight size={16} /> Comece sua transformação!</li>
                    </ul>
                </motion.div>

                {/* WhatsApp Group Button */}
                <motion.a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    className={styles.whatsappButton}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    Entrar no Grupo VIP
                </motion.a>

                {/* Back to Home */}
                <Link href="/" className={styles.backLink}>
                    Voltar para o início
                </Link>
            </motion.div>
        </main>
    );
}
