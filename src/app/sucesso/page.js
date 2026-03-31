'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';

function SucessoContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'seu endereço de e-mail';

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className={styles.successBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                <CheckCircle size={36} strokeWidth={2} />
            </motion.div>

            <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Obrigado pela sua compra! 🎉
            </motion.h1>

            <motion.p
                style={{ fontSize: '1.2rem', color: '#2E8B6A', marginTop: '20px', lineHeight: '1.6' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                A sua aquisição do <strong>Gut Reset (Turma 3)</strong> foi processada com sucesso.
            </motion.p>

            <motion.div
                style={{ backgroundColor: '#f4faf8', padding: '25px', borderRadius: '12px', marginTop: '30px', border: '1px solid #cce5dd' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Mail size={32} color="#2E8B6A" style={{ marginBottom: '15px' }} />
                </div>
                <h3 style={{ color: '#2E8B6A', marginBottom: '10px' }}>O material foi enviado para o seu e-mail</h3>
                <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '10px' }}>Você receberá em instantes as instruções de acesso e os materiais no e-mail:</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1a543f' }}>{email}</p>
                
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '20px' }}>
                    ⚠️ <strong>Atenção:</strong> O e-mail contém o seu Protocolo Oficial, os Bônus (se aplicável), e também o link para entrar no nosso <strong>Grupo Exclusivo do WhatsApp</strong>. <br/><br/>
                    <em>Verifique a sua caixa de entrada, caixa de SPAM e a aba &quot;Promoções&quot;.</em>
                </p>
            </motion.div>
        </motion.div>
    );
}

export default function SucessoPage() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<div style={{ padding: '50px', color: '#2E8B6A' }}>Carregando dados da compra...</div>}>
                <SucessoContent />
            </Suspense>
        </main>
    );
}
