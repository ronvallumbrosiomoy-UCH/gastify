import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient>;

async function createClient(): Promise<MongoClient> {
  if (!uri) {
    return new MongoClient("mongodb://localhost:27017").connect();
  }
  return new MongoClient(uri).connect();
}

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
