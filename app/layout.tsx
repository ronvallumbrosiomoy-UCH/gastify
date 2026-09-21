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
      <body className="min-h-screen bg-mesh noise">
        <Providers>
          <Navigation />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
            {children}
          </main>
          <footer className="border-t border-black/5 py-10 mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="text-[14px] text-gray-brand">
                  © 2026 Gastify
                </span>
              </div>
              <div className="flex gap-6">
                <Link href="/privacidad" className="text-[13px] text-gray-brand hover:text-graphite-brand transition-colors">
                  Privacidad
                </Link>
                <Link href="/terminos" className="text-[13px] text-gray-brand hover:text-graphite-brand transition-colors">
                  Términos
                </Link>
                <Link href="/cookies" className="text-[13px] text-gray-brand hover:text-graphite-brand transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
