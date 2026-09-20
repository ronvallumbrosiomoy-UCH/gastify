export const metadata = {
  title: "Términos y Condiciones — Gastify",
};

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-graphite-brand mb-6">Términos y Condiciones</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">1. Aceptación de términos</h2>
        <p className="text-text-secondary leading-relaxed">
          Al usar Gastify, aceptas estos términos. Si no estás de acuerdo, no uses el servicio.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">2. Servicio</h2>
        <p className="text-text-secondary leading-relaxed">
          Gastify es una herramienta de gestión financiera personal. No somos asesores financieros
          certificados. Los insights generados son informativos y no constituyen asesoría financiera profesional.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">3. Suscripciones</h2>
        <p className="text-text-secondary leading-relaxed">
          El plan Premium ofrece funcionalidades adicionales. Los pagos se procesan a través de Stripe.
          Puedes cancelar tu suscripción en cualquier momento. No realizamos reembolsos prorrateados.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">4. Responsabilidad</h2>
        <p className="text-text-secondary leading-relaxed">
          No nos hacemos responsables por decisiones financieras tomadas basándose en los datos
          mostrados. Verifica siempre con tu banco y SUNAT.
        </p>
      </section>
    </div>
  );
}