import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PáginasPro.cl — CRM de Ventas y Operaciones',
  description: 'Panel privado de gestión comercial, pipeline de clientes, presupuestos e informes de entrega de PáginasPro.cl.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'PáginasPro.cl — CRM de Ventas',
    description: 'Sistema integral de operaciones y gestión comercial.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PáginasPro.cl — CRM',
    description: 'Sistema integral de operaciones y gestión comercial.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
