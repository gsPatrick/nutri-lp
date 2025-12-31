import "./globals.css";

export const metadata = {
  title: "Nutri LP - Protocolo Gut Reset",
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
