"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  SectionHeading,
  Badge,
  PrimaryButton,
  Spinner,
} from "@/components/ui/primitives";
import { Clock, Database, RefreshCw, CheckCircle } from "lucide-react";

interface RunItem {
  id: string;
  experimentId: string;
  experimentTitle: string;
  moduleName: string;
  docName?: string;
  parameters?: Record<string, unknown>;
  metricsSummary?: Record<string, unknown>;
  createdAt: string;
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch("/api/history?limit=30");
      const data = await res.json();
      if (Array.isArray(data.runs)) {
        setRuns(data.runs);
      }
    } catch {
      // In-memory or offline state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Academic Tracking"
        title="Laboratory Experiment History"
        description="Chronological record of NLP practical executions stored in MongoDB. Useful for student viva verification and faculty laboratory grading."
      />

      <Card>
        <CardHeader
          title="Executed Laboratory Runs"
          subtitle="Showing recent automated and user-triggered experiments"
          action={
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          }
        />
        <CardBody className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size={24} />
            </div>
          ) : runs.length > 0 ? (
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3">Experiment #</th>
                  <th className="py-2.5 pr-4">Title / Module</th>
                  <th className="py-2.5 pr-4">Active Document</th>
                  <th className="py-2.5 pr-4">Output / Metrics Summary</th>
                  <th className="py-2.5 pr-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3">
                      <Badge tone="indigo">{run.experimentId}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">{run.experimentTitle}</p>
                      <p className="text-[11px] text-slate-500">{run.moduleName}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{run.docName || "Ad-hoc Input"}</td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {run.metricsSummary ? JSON.stringify(run.metricsSummary) : "—"}
                    </td>
                    <td className="py-3 pr-3 text-slate-500">
                      {new Date(run.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              <Database size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No experiment runs logged yet.</p>
              <p className="mt-1 text-slate-400">
                Run any experiment module (Sentiment, Classification, Topics, Preprocessing) to see records here.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
