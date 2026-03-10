import { Providers } from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-container">
            <Sidebar />
            <div className="main-content">
              <Header />
              <main className="content-area">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
