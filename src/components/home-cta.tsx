"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useDocument } from "@/components/document-context";
import { PrimaryButton, SecondaryButton, Spinner } from "@/components/ui/primitives";

export function HomeCta() {
  const { loadSample } = useDocument();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSample() {
    setLoading(true);
    try {
      await loadSample();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/analyzer">
        <PrimaryButton>Analyze Document</PrimaryButton>
      </Link>
      <Link href="/dashboard">
        <SecondaryButton>Explore NLP Tools</SecondaryButton>
      </Link>
      <SecondaryButton onClick={handleSample} disabled={loading}>
        {loading ? <Spinner /> : null}
        {loading ? "Loading sample…" : "Use Sample Document"}
      </SecondaryButton>
    </div>
  );
}
