export const metadata = {
  title: "Política de Privacidad — Gastify",
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto prose prose-emerald">
      <h1 className="text-3xl font-bold text-graphite-brand mb-6">Política de Privacidad</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">1. Datos que recopilamos</h2>
        <p className="text-text-secondary leading-relaxed">
          Gastify recopila solo los datos necesarios para funcionar: tu nombre, email, y los datos
          de las transacciones que detectamos. <strong>Nunca almacenamos el contenido completo de tus emails.</strong>
          Solo extraemos la información de la transacción (monto, comercio, fecha, banco).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">2. Uso de Google API Services</h2>
        <p className="text-text-secondary leading-relaxed">
          Gastify cumple con la <strong>Google API Services User Data Policy</strong> (Limited Use).
          Los datos obtenidos de la Gmail API se utilizan exclusivamente para:
        </p>
        <ul className="list-disc list-inside text-text-secondary leading-relaxed mt-2 space-y-1">
          <li>Detectar transacciones bancarias en tus emails</li>
          <li>Extraer información de la transacción para tu dashboard</li>
          <li>Nunca se comparte con terceros ni se usa para publicidad</li>
          <li>Nunca se usa para entrenar modelos de IA</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">3. Almacenamiento</h2>
        <p className="text-text-secondary leading-relaxed">
          Tus datos se almacenan de forma cifrada en MongoDB Atlas. Las contraseñas se cifran con
          bcrypt. Puedes desconectar tu Gmail o eliminar tu cuenta en cualquier momento.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-graphite-brand mb-3">4. Contacto</h2>
        <p className="text-text-secondary leading-relaxed">
          Para cualquier consulta sobre privacidad, escríbenos a soporte@gastify.app.
        </p>
      </section>

      <p className="text-xs text-text-secondary mt-8">
        Última actualización: Septiembre 2026
      </p>
    </div>
  );
}