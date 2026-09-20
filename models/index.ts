import { Schema, model, models } from "mongoose";

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    phone: { type: String },
    country: { type: String, default: "PE" },
    role: { type: String, enum: ["user", "premium"], default: "user" },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    streakDays: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);

export const TransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    monto: { type: Number, required: true },
    comercio: { type: String, required: true },
    categoria: { type: String, required: true },
    fecha: { type: Date, required: true },
    moneda: { type: String, default: "PEN" },
    banco: { type: String },
    ultimos4: { type: String },
    tipo: { type: String, enum: ["gasto", "ingreso"], default: "gasto" },
    empresa_o_personal: { type: String, enum: ["empresa", "personal"], default: "personal" },
    es_fijo: { type: Boolean, default: false },
    procesadoPor: { type: String, default: "IA" },
    reglaAplicada: { type: String },
  },
  { timestamps: true }
);

export const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);

export const GmailConnectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    connectedAt: { type: Date, default: Date.now },
    lastSyncAt: { type: Date },
    labelFilter: { type: String, default: "" },
    remitentesPermitidos: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const GmailConnection =
  models.GmailConnection || model("GmailConnection", GmailConnectionSchema);

export const RuleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nombre: { type: String, required: true },
    condicion: { type: String, required: true },
    categoria: { type: String, required: true },
    prioridad: { type: Number, default: 0 },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Rule = models.Rule || model("Rule", RuleSchema);
