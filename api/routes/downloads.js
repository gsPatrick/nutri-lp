const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Store IP locks in memory (PaymentId -> IP Address)
// This will reset on server restart, but token still expires in 24h
const ipLocks = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'gutreset-secret-key-safe-fallback-2026';

function verifyAndCheckIp(req, res, next) {
    const token = req.params.token;
    if (!token) {
        return res.status(403).send('Link inválido.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { pId } = decoded;

        // Strip localized proxy headers to get real IP if behind Easypanel/Nginx
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (clientIp && clientIp.includes(',')) {
            clientIp = clientIp.split(',')[0].trim();
        }

        if (ipLocks.has(pId)) {
            const lockedIp = ipLocks.get(pId);
            if (lockedIp !== clientIp) {
                return res.status(403).send(`
                    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                        <h2 style="color: red;">Acesso Negado</h2>
                        <p>Este link já foi utilizado em outro dispositivo ou rede.</p>
                        <p>Por motivos de segurança (Anti-Pirataria), o link de download é bloqueado para compartilhamento.</p>
                    </div>
                `);
            }
        } else {
            // Bind IP to this payment ID
            ipLocks.set(pId, clientIp);
        }

        req.downloadData = decoded;
        next();
    } catch (err) {
        return res.status(403).send(`
            <div style="font-family: sans-serif; padding: 40px; text-align: center;">
                <h2 style="color: red;">Link Expirado ou Inválido</h2>
                <p>Este link de segurança expira 24h após a sua compra.</p>
                <p>Caso precise do material novamente, verifique os anexos do e-mail de confirmação original.</p>
            </div>
        `);
    }
}

/**
 * GET /api/downloads/:token
 * Renderiza página de download
 */
router.get('/:token', verifyAndCheckIp, (req, res) => {
    const { token } = req.params;
    const { bns } = req.downloadData; // bns = hasBonus boolean

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Download Oficial - Gut Reset</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background-color: #f4faf8; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; max-width: 500px; width: 100%; border-top: 5px solid #2E8B6A; }
                .title { color: #2E8B6A; margin-bottom: 20px; }
                .desc { color: #555; margin-bottom: 30px; line-height: 1.5; }
                .btn { display: inline-block; width: 100%; background-color: #2E8B6A; color: white; padding: 15px 20px; text-decoration: none; border-radius: 50px; font-weight: bold; margin-bottom: 15px; box-sizing: border-box; transition: background 0.3s; }
                .btn:hover { background-color: #246f54; }
                .btn-bonus { background-color: #ff9800; }
                .btn-bonus:hover { background-color: #e68a00; }
                .footer { margin-top: 30px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1 class="title">Seu Protocolo Gut Reset</h1>
                <p class="desc">Este é o seu link de segurança de acesso único. Clique nos botões abaixo para baixar os seus arquivos PDF diretamente para o seu celular ou computador.</p>
                
                <a href="/api/downloads/${token}/file/main" download="Protocolo_Gut_Reset.pdf" class="btn">
                    📥 BAIXAR PROTOCOLO PRINCIPAL
                </a>

                ${bns ? `
                <a href="/api/downloads/${token}/file/bonus" download="Bonus_Exames.pdf" class="btn btn-bonus">
                    🎁 BAIXAR BÔNUS 24H (Exames)
                </a>
                ` : ''}

                <div class="footer">Este link irá expirar em 24h a partir do envio. Não compartilhe com ninguém.</div>
            </div>
        </body>
        </html>
    `);
});

/**
 * GET /api/downloads/:token/file/:type
 * Returns the actual PDF file
 */
router.get('/:token/file/:type', verifyAndCheckIp, (req, res) => {
    const { type } = req.params;
    const { bns } = req.downloadData;
    
    if (type === 'bonus' && !bns) {
        return res.status(403).send('Bônus não habilitado para esta compra.');
    }

    const pdfBasePath = path.join(__dirname, '../assets/pdfs');
    let folder = type === 'main' ? 'conteudo_principal' : 'bonus_24h';
    const targetFolder = path.join(pdfBasePath, folder);

    if (fs.existsSync(targetFolder)) {
        const files = fs.readdirSync(targetFolder);
        const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
        
        if (pdfFile) {
            const filePath = path.join(targetFolder, pdfFile);
            return res.download(filePath, pdfFile);
        }
    }

    res.status(404).send('Arquivo temporariamente indisponível.');
});

module.exports = router;
