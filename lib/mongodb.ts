import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise: Promise<MongoClient>;

if (uri && process.env.NODE_ENV !== "production") {
  const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (globalWithMongo._mongoClientPromise) {
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
    clientPromise = globalWithMongo._mongoClientPromise;
  }
} else if (uri) {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
} else {
  clientPromise = Promise.resolve(new MongoClient("mongodb://localhost:27017"));
}

export default clientPromise;
