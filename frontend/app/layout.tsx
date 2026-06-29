import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'SportsPlusStore — Premium Sports Equipment',
    template: '%s | SportsPlusStore',
  },
  description:
    'Shop premium sports equipment, clothing and accessories. Free delivery on orders over $50.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout — server component.
 *
 * Renders the HTML shell and delegates client-side provider setup to the
 * <Providers> client component (MUI theme, notistack, auth rehydration).
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
