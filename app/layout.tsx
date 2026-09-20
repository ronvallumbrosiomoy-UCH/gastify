import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/ui/Navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
