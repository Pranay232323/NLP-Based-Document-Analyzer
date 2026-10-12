import { getMongoDb } from "@/lib/mongodb";
import type { AnalysisResult, SimilarityResult } from "@/lib/nlp/types";

export interface ExperimentRunRecord {
  experimentId: string;
  experimentTitle: string;
  moduleName: string;
  docName?: string;
  parameters?: Record<string, unknown>;
  metricsSummary?: Record<string, unknown>;
  createdAt: Date;
}

export async function saveAnalysis(docName: string, rawText: string, result: AnalysisResult) {
  const db = await getMongoDb();
  if (!db) return { persisted: false };

  const now = new Date();
  const documentInsert = await db.collection("documents").insertOne({
    docName,
    rawText,
    charCount: rawText.length,
    wordCount: result.meta.stats.wordCount,
    createdAt: now,
  });

  await db.collection("analyses").insertOne({
    documentId: documentInsert.insertedId,
    docName,
    stats: result.meta.stats,
    scriptValidation: result.meta.scriptValidation,
    entitiesCount: result.entities.length,
    result,
    createdAt: now,
  });

  return { persisted: true, documentId: String(documentInsert.insertedId) };
}

export async function saveComparison(result: SimilarityResult) {
  const db = await getMongoDb();
  if (!db) return { persisted: false };

  const insert = await db.collection("comparisons").insertOne({
    ...result,
    createdAt: new Date(),
  });

  return { persisted: true, comparisonId: String(insert.insertedId) };
}

export async function saveReport(report: Record<string, unknown>) {
  const db = await getMongoDb();
  if (!db) return { persisted: false };

  const insert = await db.collection("reports").insertOne({
    ...report,
    createdAt: new Date(),
  });

  return { persisted: true, reportId: String(insert.insertedId) };
}

export async function saveExperimentRun(run: Omit<ExperimentRunRecord, "createdAt">) {
  const db = await getMongoDb();
  if (!db) return { persisted: false };

  const record: ExperimentRunRecord = {
    ...run,
    createdAt: new Date(),
  };

  const insert = await db.collection("experiment_runs").insertOne(record);
  return { persisted: true, runId: String(insert.insertedId) };
}

export async function getExperimentRuns(limit: number = 20) {
  const db = await getMongoDb();
  if (!db) return [];

  const cursor = db.collection("experiment_runs")
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit);

  const results = await cursor.toArray();
  return results.map((doc) => ({
    id: String(doc._id),
    experimentId: doc.experimentId,
    experimentTitle: doc.experimentTitle,
    moduleName: doc.moduleName,
    docName: doc.docName,
    parameters: doc.parameters,
    metricsSummary: doc.metricsSummary,
    createdAt: doc.createdAt,
  }));
}
