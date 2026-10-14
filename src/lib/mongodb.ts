import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || "nlp_academic_analyzer";

const globalForMongo = globalThis as typeof globalThis & {
  __mongoClient?: MongoClient | null;
  __mongoLastFail?: number;
};

function createClient(): MongoClient | null {
  if (!uri) return null;
  return new MongoClient(uri, {
    serverSelectionTimeoutMS: 1500,
    connectTimeoutMS: 2000,
  });
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) return null;

  // If connection failed within the last 30 seconds, avoid blocking requests
  const now = Date.now();
  if (globalForMongo.__mongoLastFail && now - globalForMongo.__mongoLastFail < 30_000) {
    return null;
  }

  try {
    if (!globalForMongo.__mongoClient) {
      const client = createClient();
      if (!client) return null;
      await client.connect();
      globalForMongo.__mongoClient = client;
      globalForMongo.__mongoLastFail = undefined;
    }
    return globalForMongo.__mongoClient;
  } catch (err) {
    globalForMongo.__mongoLastFail = Date.now();
    globalForMongo.__mongoClient = null;
    console.warn("[MongoDB] Database connection offline or unreachable:", (err as Error).message);
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  try {
    const client = await getMongoClient();
    if (!client) return null;
    return client.db(dbName);
  } catch {
    return null;
  }
}

export async function pingMongo(): Promise<{ configured: boolean; connected: boolean; database: string }> {
  if (!uri) {
    return { configured: false, connected: false, database: dbName };
  }
  try {
    const db = await getMongoDb();
    if (!db) {
      return { configured: true, connected: false, database: dbName };
    }
    await db.command({ ping: 1 });
    return { configured: true, connected: true, database: dbName };
  } catch {
    return { configured: true, connected: false, database: dbName };
  }
}
