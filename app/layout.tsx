import Link from "next/link";
import Navigation from "@/components/ui/Navigation";
import Providers from "@/components/ui/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-apple">
        <Providers>
          <Navigation />
          <main style={{ maxWidth: "1152px", margin: "0 auto", padding: "32px 24px", flex: 1, position: "relative", zIndex: 10 }}>
            {children}
          </main>
          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-brand">
                <div className="footer-logo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="footer-text">© 2026 Gastify</span>
              </div>
              <div className="footer-links">
                <Link href="/privacidad" className="footer-link">Privacidad</Link>
                <Link href="/terminos" className="footer-link">Términos</Link>
                <Link href="/cookies" className="footer-link">Cookies</Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
