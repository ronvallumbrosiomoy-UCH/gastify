export interface ParsedTransaction {
  monto: number;
  comercio: string;
  fecha: string;
  moneda: string;
  categoria: string;
  banco: string;
  ultimos4?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
}

const REMITENTES_BANCARIOS = [
  "bcp",
  "bbva",
  "interbank",
  "scotiabank",
  "mibank",
  "banco de credito",
  "banco del credito",
  "banco continental",
  "끼nka",
  "pago efectivo",
  "yape",
  "plin",
  "nubank",
  "fintual",
];

const EMAIL_PATTERNS_BANCARIOS = [
  /@bcp\.com\.pe/i,
  /@bbva\.com/i,
  /@interbank\.com\.pe/i,
  /@scotiabank\.com\.pe/i,
  /@mibank\.com\.pe/i,
  /@bcm\.com\.pe/i,
  /@ continental\.com\.pe/i,
  /@yape\.com\.pe/i,
  /@plin\.com\.pe/i,
  /@pagoefectivo\.net/i,
  /no.?reply.*bcp/i,
  /no.?reply.*bbva/i,
  /no.?reply.*interbank/i,
  /no.?reply.*scotia/i,
  /alertas.*bcp/i,
  /alertas.*bbva/i,
  /notificacion.*bcp/i,
  /notificacion.*bbva/i,
];

export function esRemitenteBancario(from: string): boolean {
  const f = from.toLowerCase();
  if (REMITENTES_BANCARIOS.some((b) => f.includes(b))) return true;
  return EMAIL_PATTERNS_BANCARIOS.some((p) => p.test(from));
}

export function getBancoFromEmail(from: string): string {
  const f = from.toLowerCase();
  if (f.includes("bcp") || f.includes("banco de credito") || f.includes("bcm")) return "BCP";
  if (f.includes("bbva") || f.includes("continental")) return "BBVA";
  if (f.includes("interbank")) return "Interbank";
  if (f.includes("scotiabank") || f.includes("scotia")) return "Scotiabank";
  if (f.includes("mibank") || f.includes("mi bank")) return "MiBank";
  if (f.includes("yape")) return "Yape";
  if (f.includes("plin")) return "Plin";
  if (f.includes("pago efectivo")) return "PagoEfectivo";
  return "Desconocido";
}

export const CATEGORIAS_BASE = [
  "Comida",
  "Transporte",
  "Servicios",
  "Compras",
  "Salud",
  "Delivery",
  "Supermercado",
  "Entretenimiento",
  "Gastos Hormiga",
  "Educacion",
  "Suscripciones",
  "Otros",
];

export const COMERCIO_CATEGORIA: Record<string, string> = {
  uber: "Transporte",
  taxi: "Transporte",
  rapitaxi: "Transporte",
  indriver: "Transporte",
  diit: "Transporte",
  movilidad: "Transporte",
  parking: "Transporte",
  gasolina: "Transporte",
  repsol: "Transporte",
  grilli: "Transporte",
  rappi: "Delivery",
  pedidosya: "Delivery",
  didi_food: "Delivery",
  glu: "Delivery",
  cuponatic: "Delivery",
  starbucks: "Comida",
  kfc: "Comida",
  bembos: "Comida",
  pollo: "Comida",
  mcdonalds: "Comida",
  papa: "Comida",
  tgi: "Comida",
  Starbucks: "Comida",
  ziggy: "Comida",
  burger: "Comida",
  pizza: "Comida",
  tambo: "Supermercado",
  metro: "Supermercado",
  plaza: "Supermercado",
  wong: "Supermercado",
  tottus: "Supermercado",
  viva: "Supermercado",
  hiperbodega: "Supermercado",
  cencosud: "Supermercado",
  oechsle: "Compras",
  netflix: "Suscripciones",
  spotify: "Suscripciones",
  youtube: "Suscripciones",
  hbo: "Suscripciones",
  disney: "Suscripciones",
  amazon: "Compras",
  mercado: "Compras",
  falabella: "Compras",
  saga: "Compras",
  ripley: "Compras",
  sutti: "Compras",
  ikea: "Compras",
  farmacia: "Salud",
  inka: "Salud",
  miFarma: "Salud",
  cruz: "Salud",
  essalud: "Salud",
  claro: "Servicios",
  movistar: "Servicios",
  entel: "Servicios",
  bitel: "Servicios",
  luz: "Servicios",
  agua: "Servicios",
  sedapal: "Servicios",
  google: "Servicios",
  apple: "Servicios",
  play: "Entretenimiento",
  movie: "Entretenimiento",
  cine: "Entretenimiento",
  udlap: "Educacion",
  upc: "Educacion",
  uni: "Educacion",
  coursera: "Educacion",
  udemy: "Educacion",
};

export function categorizarPorComercio(comercio: string): string {
  const c = comercio.toLowerCase();
  for (const [key, cat] of Object.entries(COMERCIO_CATEGORIA)) {
    if (c.includes(key.toLowerCase())) return cat;
  }
  return "Otros";
}
