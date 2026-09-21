import { promises as dnsPromises } from "dns";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const MONGO_OPTIONS = {
  tls: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

async function createClient(): Promise<MongoClient> {
  if (!uri) {
    return new MongoClient("mongodb://localhost:27017").connect();
  }

  if (uri.startsWith("mongodb+srv://")) {
    try {
      const resolver = new dnsPromises.Resolver();
      resolver.setServers(["8.8.8.8"]);
      const url = new URL(uri);
      const [addresses, txtRecords] = await Promise.all([
        resolver.resolveSrv(`_mongodb._tcp.${url.hostname}`),
        resolver.resolveTxt(`_mongodb._tcp.${url.hostname}`),
      ]);
      const hosts = addresses.map((a) => `${a.name}:${a.port}`).join(",");
      const params = new URLSearchParams(txtRecords[0]?.join("") || "");
      const replicaSet = params.get("replicaSet") || "";
      const authSource = params.get("authSource") || "admin";
      const directUri = `mongodb://${url.username}:${url.password}@${hosts}${url.pathname}?retryWrites=true&w=majority&replicaSet=${replicaSet}&authSource=${authSource}`;
      return new MongoClient(directUri, MONGO_OPTIONS).connect();
    } catch (e) {
      console.error("SRV resolution failed, trying original URI:", e);
      return new MongoClient(uri, MONGO_OPTIONS).connect();
    }
  }

  return new MongoClient(uri, { ...MONGO_OPTIONS, tls: false }).connect();
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV !== "production") {
  const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClient();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = createClient();
}

export default clientPromise;
