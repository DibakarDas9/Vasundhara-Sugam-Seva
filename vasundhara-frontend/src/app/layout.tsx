import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('@/components/chat/ChatBot'), { ssr: false });
const ClickEffects = dynamic(() => import('@/components/ui/ClickEffects'), { ssr: false });
const VoiceAddMount = dynamic(() => import('@/components/voice/VoiceAddMount'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vasundhara',
  description: 'Sugam Seva — seamless, dignified food support for every home and shop.',
  keywords: 'Vasundhara,Sugam Seva,food support,inventory,meal planning,community aid',
  authors: [{ name: 'Vasundhara Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#10b981',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <div className="h-full">
          <Providers>
            {children}
            <ChatBot />
            <VoiceAddMount />
            <ClickEffects />
          </Providers>
        </div>
      </body>
    </html>
  );
}