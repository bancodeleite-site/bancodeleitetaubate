import type {Metadata} from 'next';
import { Outfit, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Banco de Leite Humano | Taubaté',
  description: 'Um legado de amor que começou em 1943, cuidando de gerações com pioneirismo em saúde infantil e maternidade em Taubaté!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`scroll-smooth ${outfit.variable} ${manrope.variable}`}>
      <body suppressHydrationWarning className="font-sans text-slate-800 bg-[#fbfbfd] antialiased selection:bg-primary/20 selection:text-primary-dark">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
