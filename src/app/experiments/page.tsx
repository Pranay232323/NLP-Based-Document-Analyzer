import Link from "next/link";
import { Card, CardBody, SectionHeading, Badge, PrimaryButton } from "@/components/ui/primitives";

const MAPPING = [
  { exp: 1, topic: "NLP Applications / Project Introduction", module: "About Project", href: "/about" },
  { exp: 2, topic: "Tokenization, Filtration & Script Validation", module: "Text Preprocessing", href: "/preprocessing" },
  { exp: 3, topic: "Stop Word Removal, Stemming & Lemmatization", module: "Stemming & Lemmatization", href: "/stemlemma" },
  { exp: 4, topic: "Morphological Analysis & Word Generation", module: "Morphology Analyzer", href: "/morphology" },
  { exp: 5, topic: "N-Gram Model for Prediction & Generation", module: "N-Gram Lab", href: "/ngram" },
  { exp: 6, topic: "Part-of-Speech Tagging", module: "POS Tagger", href: "/pos" },
  { exp: 7, topic: "Chunking (NP / VP / PP)", module: "Chunk Analyzer", href: "/chunking" },
  { exp: 8, topic: "Named Entity Recognition", module: "Named Entity Recognition", href: "/ner" },
  { exp: 9, topic: "TF-IDF + Cosine Similarity", module: "Document Similarity", href: "/similarity" },
  { exp: 10, topic: "Word Cloud / Text EDA", module: "Word Cloud / Text Analytics", href: "/wordcloud" },
];

export default function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="For Evaluation"
        title="Experiment Mapping"
        description="This table maps each of the 10 prescribed NLP practicals to the corresponding integrated module in this platform — useful for demonstrating syllabus coverage to the external examiner."
      />

      <Card>
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">#</th>
                <th className="py-3 pr-4">Topic</th>
                <th className="py-3 pr-4">Application Module</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {MAPPING.map((m) => (
                <tr key={m.exp} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <Badge tone="indigo">Exp {m.exp}</Badge>
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-800">{m.topic}</td>
                  <td className="py-3 pr-4 text-slate-600">{m.module}</td>
                  <td className="py-3 pr-4 text-right">
                    <Link href={m.href}>
                      <PrimaryButton className="px-3 py-1.5 text-xs">Open Module</PrimaryButton>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
