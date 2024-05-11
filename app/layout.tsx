import { Metadata } from 'next';
import 'dockview/dist/styles/dockview.css';
import './global.css';

export const metadata: Metadata = {
  title: 'React Project Tutorial',
  description: 'React Project Tutorial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
