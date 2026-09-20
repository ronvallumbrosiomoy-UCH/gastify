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
          <footer className="border-t border-card-border py-8 mt-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-text-secondary">
                © 2026 Gastify. Hecho con 💚 en Perú.
              </p>
              <div className="flex gap-6">
                <Link href="/privacidad" className="text-xs text-text-secondary hover:text-emerald-brand transition-all">
                  Privacidad
                </Link>
                <Link href="/terminos" className="text-xs text-text-secondary hover:text-emerald-brand transition-all">
                  Términos
                </Link>
                <Link href="/cookies" className="text-xs text-text-secondary hover:text-emerald-brand transition-all">
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