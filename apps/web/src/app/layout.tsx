import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'tkbetter',
  description: 'tkbetter web app',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
