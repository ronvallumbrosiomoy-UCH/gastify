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
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <Providers>
          <Navigation />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
            {children}
          </main>
          <footer className="border-t border-card-border py-8 mt-12 bg-white/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Logo & Description */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-brand to-emerald-brand/80 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">G</span>
                    </div>
                    <span className="text-lg font-semibold text-graphite-brand tracking-tight">
                      Gastify
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary text-center md:text-left">
                    Tu dinero, tu control. Hecho con 💚 en Perú.
                  </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-6">
                  <Link
                    href="/privacidad"
                    className="text-sm text-text-secondary hover:text-emerald-brand transition-all"
                  >
                    Privacidad
                  </Link>
                  <Link
                    href="/terminos"
                    className="text-sm text-text-secondary hover:text-emerald-brand transition-all"
                  >
                    Términos
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-sm text-text-secondary hover:text-emerald-brand transition-all"
                  >
                    Cookies
                  </Link>
                </div>

                {/* Copyright */}
                <p className="text-xs text-text-secondary">
                  © 2026 Gastify. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
