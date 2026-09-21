import { promises as dnsPromises } from "dns";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

async function createClient(): Promise<MongoClient> {
  if (!uri) {
    return new MongoClient("mongodb://localhost:27017").connect();
  }

  if (uri.startsWith("mongodb+srv://")) {
    try {
      const resolver = new dnsPromises.Resolver();
      resolver.setServers(["8.8.8.8"]);
      const url = new URL(uri);
      const addresses = await resolver.resolveSrv(`_mongodb._tcp.${url.hostname}`);
      const hosts = addresses.map((a) => `${a.name}:${a.port}`).join(",");
      const directUri = `mongodb://${url.username}:${url.password}@${hosts}${url.pathname}${url.search}`;
      return new MongoClient(directUri).connect();
    } catch (e) {
      console.error("SRV resolution failed, trying original URI:", e);
      return new MongoClient(uri).connect();
    }
  }

  return new MongoClient(uri).connect();
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
