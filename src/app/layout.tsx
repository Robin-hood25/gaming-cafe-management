import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Nexus Gaming Lounge — Live Availability & Lounge Info',
  description: 'Premier esports and console gaming lounge in Indiranagar, Bengaluru. Check live screen availability in real time.',
  keywords: ['Gaming Cafe', 'PS5 Lounge', 'Esports Cafe Bengaluru', 'Gaming PC', 'Sim Racing', 'Live Screen Availability'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

