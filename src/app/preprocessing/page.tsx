"use client";

import { useDocument } from "@/components/document-context";
import { NoDocumentState } from "@/components/no-document-state";
import { Card, CardBody, CardHeader, SectionHeading, Badge, StatCard } from "@/components/ui/primitives";

function TokenChips({ tokens, tone }: { tokens: string[]; tone: "slate" | "rose" | "emerald" }) {
  if (tokens.length === 0) return <p className="text-sm text-slate-400">None</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tokens.slice(0, 200).map((t, i) => (
        <Badge key={`${t}-${i}`} tone={tone}>
          {t}
        </Badge>
      ))}
      {tokens.length > 200 && <span className="text-xs text-slate-400">+{tokens.length - 200} more</span>}
    </div>
  );
}

export default function PreprocessingPage() {
  const { analysis } = useDocument();

  if (!analysis) {
    return (
      <div className="space-y-6">
        <SectionHeading eyebrow="NLP Tool" title="Text Preprocessing" description="Tokenization, Filtration and Script Validation." />
        <NoDocumentState moduleName="preprocessing" />
      </div>
    );
  }

  const { preprocessing } = analysis;

  return (
    <div className="space-y-6">
      <SectionHeading
eyebrow="NLP Tool"
        title="Tokenization, Filtration & Script Validation"
        description="The raw document text flows through tokenization, then filtration (stop words / numerals / punctuation removed), and finally script validation."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Raw Tokens" value={preprocessing.rawTokens.length} />
        <StatCard label="Word Tokens" value={preprocessing.wordTokens.length} />
        <StatCard label="Filtered Tokens" value={preprocessing.filteredTokens.length} tone="emerald" />
        <StatCard label="Stopwords Removed" value={preprocessing.removedStopwords.length} tone="rose" />
      </div>

      <Card>
        <CardHeader title="Step 1 · Original Text" />
        <CardBody>
          <p className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{preprocessing.originalText}</p>
        </CardBody>
      </Card>

      <div className="flex justify-center text-slate-300">↓</div>

      <Card>
        <CardHeader title="Step 2 · Tokens" subtitle={`${preprocessing.rawTokens.length} raw tokens (words, numbers & punctuation)`} />
        <CardBody>
          <TokenChips tokens={preprocessing.rawTokens} tone="slate" />
        </CardBody>
      </Card>

      <div className="flex justify-center text-slate-300">↓</div>

      <Card>
        <CardHeader title="Step 3 · Filtration" subtitle="Stop words, numeric tokens and punctuation removed" />
        <CardBody className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">Filtered (Meaningful) Tokens</p>
            <TokenChips tokens={preprocessing.filteredTokens} tone="emerald" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500">Removed Stop Words</p>
            <TokenChips tokens={preprocessing.removedStopwords} tone="rose" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Removed Numeric Tokens</p>
            <TokenChips tokens={preprocessing.removedNumeric} tone="slate" />
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-center text-slate-300">↓</div>

      <Card>
        <CardHeader title="Step 4 · Script Validation" />
        <CardBody>
          <div className="flex items-center gap-3">
            <Badge tone={preprocessing.scriptValidation.isValid ? "emerald" : "rose"} className="text-sm">
              {preprocessing.scriptValidation.label}
            </Badge>
            <p className="text-sm text-slate-600">
              {preprocessing.scriptValidation.latinChars} Latin letters out of {preprocessing.scriptValidation.totalAlphaChars} alphabetic
              characters ({preprocessing.scriptValidation.latinRatio}%)
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
