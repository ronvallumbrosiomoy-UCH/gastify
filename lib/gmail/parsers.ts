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
  "banco de credito",
  "banco del credito",
  "banco continental",
];

export function esRemitenteBancario(from: string): boolean {
  const f = from.toLowerCase();
  return REMITENTES_BANCARIOS.some((b) => f.includes(b));
}

export function getBancoFromEmail(from: string): string {
  const f = from.toLowerCase();
  if (f.includes("bcp") || f.includes("banco de credito")) return "BCP";
  if (f.includes("bbva") || f.includes("continental")) return "BBVA";
  if (f.includes("interbank")) return "Interbank";
  if (f.includes("scotiabank")) return "Scotiabank";
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
  "Otros",
];

export const COMERCIO_CATEGORIA: Record<string, string> = {
  uber: "Transporte",
  taxi: "Transporte",
  rapitaxi: "Transporte",
  inDriver: "Transporte",
  rappi: "Delivery",
  pedidosya: "Delivery",
  didi_food: "Delivery",
  starbucks: "Comida",
  kfc: "Comida",
  bembos: "Comida",
  pollo: "Comida",
  mcdonalds: "Comida",
  tambo: "Supermercado",
  metro: "Supermercado",
  plaza: "Supermercado",
  wong: "Supermercado",
  tottus: "Supermercado",
  netflix: "Servicios",
  spotify: "Servicios",
  youtube: "Servicios",
  claro: "Servicios",
  movistar: "Servicios",
  luz: "Servicios",
  agua: "Servicios",
  amazon: "Compras",
  mercado: "Compras",
  falabella: "Compras",
  saga: "Compras",
  ripley: "Compras",
  farmacia: "Salud",
  inka: "Salud",
  google: "Servicios",
  play: "Entretenimiento",
};

export function categorizarPorComercio(comercio: string): string {
  const c = comercio.toLowerCase();
  for (const [key, cat] of Object.entries(COMERCIO_CATEGORIA)) {
    if (c.includes(key)) return cat;
  }
  return "Otros";
}