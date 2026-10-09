"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDocument } from "@/components/document-context";
import { EmptyState, PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";

export function NoDocumentState({ moduleName }: { moduleName: string }) {
  const { loadSample, loading } = useDocument();
  const router = useRouter();

  async function handleSample() {
    await loadSample();
    router.refresh();
  }

  return (
    <EmptyState
      title={`No document analyzed yet`}
      description={`Analyze a document first to see ${moduleName} results. You can paste text, upload a file, or load the demo academic text.`}
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/analyzer">
          <PrimaryButton>Go to Document Analyzer</PrimaryButton>
        </Link>
        <SecondaryButton onClick={handleSample} disabled={loading}>
          {loading && <Spinner />} Load Demo Text
        </SecondaryButton>
      </div>
    </EmptyState>
  );
}
