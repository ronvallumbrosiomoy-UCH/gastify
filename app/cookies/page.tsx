export const metadata = {
  title: "Política de Cookies — Gastify",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-graphite-brand mb-6">Política de Cookies</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">1. Qué son las cookies</h2>
        <p className="text-text-secondary leading-relaxed">
          Las cookies son pequeños archivos que se almacenan en tu navegador para recordar tus
          preferencias y mejorar tu experiencia.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">2. Cookies que usamos</h2>
        <ul className="list-disc list-inside text-text-secondary leading-relaxed space-y-1">
          <li><strong>Cookies de sesión:</strong> para mantener tu sesión iniciada</li>
          <li><strong>Cookies de autenticación:</strong> NextAuth las usa para gestionar tu login</li>
          <li><strong>Cookies de preferencias:</strong> recordar tu tema y configuración</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">3. Gestionar cookies</h2>
        <p className="text-text-secondary leading-relaxed">
          Puedes configurar tu navegador para rechazar cookies. Sin embargo, algunas funciones
          como iniciar sesión no funcionarán sin ellas.
        </p>
      </section>
    </div>
  );
}