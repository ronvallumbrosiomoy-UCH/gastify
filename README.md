# Gastify 💰

Tu asesor financiero con IA que registra cada gasto automáticamente.

## 🚀 Quick Start

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Abrir en el navegador
[http://localhost:3000](http://localhost:3000)

## 🛠 Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** con paleta Gastify
- **MongoDB Atlas** + **Mongoose**
- **NextAuth.js** (Google OAuth + credentials)
- **Google Gemini** (IA para categorización e insights)
- **Stripe** (suscripciones premium)
- **Google APIs** (integración Gmail)

## 📁 Estructura del proyecto

```
gastify/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth
│   │   ├── transactions/                 # CRUD transacciones
│   │   ├── chat/                         # Chat con IA
│   │   └── gmail/                        # OAuth Gmail
│   ├── auth/                             # Páginas de auth
│   ├── dashboard/                        # Dashboard principal
│   ├── login/                            # Login/Registro
│   ├── layout.tsx                        # Layout raíz
│   └── page.tsx                          # Redirección
├── components/
│   ├── ui/                               # Componentes UI reutilizables
│   └── dashboard/                        # Componentes del dashboard
├── lib/
│   ├── auth.ts                           # Wrapper de NextAuth
│   └── mongodb.ts                        # Conexión MongoDB
├── models/                               # Esquemas Mongoose
├── .env.example
├── next.config.ts
├── tailwind.config.ts (inline en globals.css)
├── postcss.config.mjs
└── package.json
```

## 🎨 Identidad de marca

- **Nombre:** Gastify
- **Slogan:** "Gastify registra cada gasto por ti."
- **Paleta:** Emerald #10B981, Mint #D1FAE5, Purple #7C3AED, Graphite #1F2937

## 📋 Módulos

1. **Autenticación** — Google OAuth + email/contraseña
2. **Integración Gmail** — Lectura automática de emails bancarios
3. **Base de datos** — Transacciones con filtros
4. **Dashboard** — KPIs y gráficos
5. **Insights IA** — Frases automáticas sobre gastos
6. **Chat con IA** — Asesor financiero con function calling
7. **Aprendizaje** — Reglas personalizadas
8. **Categorización** — Auto-categorización por comercio
9. **Empresa vs Personal** — Flag por transacción
10. **Alertas** — Umbrales por categoría
11. **Monetización** — Stripe subscriptions
12. **Páginas legales** — Privacidad, T&C, Cookies

## 🔒 Seguridad

- Cuerpo de emails NUNCA se almacena
- Contraseñas con bcrypt
- Rate limiting en endpoints
- Verificación de remitentes bancarios
- Cumplimiento Google API Services User Data Policy

## 📜 Licencia

Propietaria — Gastify © 2026
