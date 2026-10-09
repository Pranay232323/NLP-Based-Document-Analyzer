import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || "nlp_academic_analyzer";

const globalForMongo = globalThis as typeof globalThis & {
  __mongoClient?: MongoClient;
};

function createClient(): MongoClient | null {
  if (!uri) return null;
  return new MongoClient(uri);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) return null;
  if (!globalForMongo.__mongoClient) {
    globalForMongo.__mongoClient = createClient()!;
    await globalForMongo.__mongoClient.connect();
  }
  return globalForMongo.__mongoClient;
}

export async function getMongoDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}

export async function pingMongo(): Promise<{ configured: boolean; connected: boolean; database: string }> {
  if (!uri) {
    return { configured: false, connected: false, database: dbName };
  }
  try {
    const db = await getMongoDb();
    await db?.command({ ping: 1 });
    return { configured: true, connected: true, database: dbName };
  } catch {
    return { configured: true, connected: false, database: dbName };
  }
}
