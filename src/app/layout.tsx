import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import ErrorBoundary from '@/components/ErrorBoundary';
import Notifications from '@/components/Notifications';
import { Toaster } from 'react-hot-toast';
import ClientComponentWrapper from '@/components/ClientComponentWrapper';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Game Matching",
  description: "ゲーマーのためのマッチングアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: undefined,
      variables: {
        colorPrimary: '#00ff00',
        colorText: '#00ff00',
        colorBackground: '#0a0a0a',
        colorInputBackground: '#1a1a1a',
        colorInputText: '#00ff00',
        colorButtonBackground: '#00ff00',
        colorButtonText: '#0a0a0a',
      },
      elements: {
        formButtonPrimary: 'bg-cyber-green hover:bg-cyber-accent text-cyber-black font-cyber',
        card: 'bg-cyber-darker border border-cyber-green shadow-neon-card',
        socialButtonsBlockButton: 'border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-black',
        socialButtonsBlockButtonText: 'text-cyber-green',
        formFieldInput: 'bg-cyber-darker border border-cyber-green text-cyber-green',
        footerActionLink: 'text-cyber-green hover:text-cyber-accent',
      },
    }}>
      <html lang="ja" className={`${inter.variable} ${orbitron.variable}`}>
        <body className="font-sans antialiased bg-cyber-black text-cyber-green">
          <div className="cyber-grid fixed inset-0 pointer-events-none" />
          <ErrorBoundary>
            <ClientComponentWrapper>
              <Notifications />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1a1a1a',
                    color: '#00ff00',
                    border: '1px solid #00ff00',
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                  },
                }}
              />
            </ClientComponentWrapper>
            <main className="min-h-screen pt-16">
              {children}
            </main>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
