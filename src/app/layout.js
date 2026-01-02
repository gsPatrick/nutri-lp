import "./globals.css";

export const metadata = {
  title: "Gut Reset - Protocolo Exclusivo",
  description: "Transforme sua saúde com o protocolo Gut Reset.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
