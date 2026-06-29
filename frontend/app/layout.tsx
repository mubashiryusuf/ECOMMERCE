import type { Metadata } from 'next';
import { Manrope, Saira, Saira_Condensed } from 'next/font/google';
import { Providers } from './providers';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

const saira = Saira({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-saira',
});

const sairaCondensed = Saira_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-saira-condensed',
});

export const metadata: Metadata = {
  title: {
    default: 'APEX — Performance Gear & Apparel',
    template: '%s | APEX',
  },
  description:
    'Premium sports equipment, footwear, and apparel from the brands that define the game.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${saira.variable} ${sairaCondensed.variable}`}
    >
      <body style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
