import Link from "next/link";
import {
  SplitSquareHorizontal,

  TextCursorInput,
  Blocks,
  Network,
  Tags,
  ScanSearch,
  GitCompareArrows,
  Cloud,
  ArrowRight,
  BookOpenCheck,
  Smile,
  Target,
  Compass,
  Key,
  Languages,
  Sparkles,
} from "lucide-react";
import { HomeCta } from "@/components/home-cta";
import { Card, Badge } from "@/components/ui/primitives";

const CORE_MODULES = [
  { href: "/about", title: "NLP Applications & Project Documentation", icon: BookOpenCheck, tone: "slate" as const },
  { href: "/preprocessing", title: "Text Preprocessing", icon: SplitSquareHorizontal, tone: "indigo" as const },
  { href: "/stemlemma", title: "Stemming & Lemmatization", icon: TextCursorInput, tone: "violet" as const },
  { href: "/morphology", title: "Morphology Analyzer", icon: Blocks, tone: "sky" as const },
  { href: "/ngram", title: "N-Gram Lab", icon: Network, tone: "emerald" as const },
  { href: "/pos", title: "POS Tagger", icon: Tags, tone: "amber" as const },
  { href: "/chunking", title: "Chunk Analyzer", icon: ScanSearch, tone: "rose" as const },
  { href: "/ner", title: "Named Entity Recognition", icon: ScanSearch, tone: "indigo" as const },
  { href: "/similarity", title: "Document Similarity", icon: GitCompareArrows, tone: "violet" as const },
  { href: "/wordcloud", title: "Word Cloud & Text Analytics", icon: Cloud, tone: "sky" as const },
];

const ADVANCED_MODULES = [
  { href: "/sentiment", title: "Sentiment Analysis & Polarity", icon: Smile, tone: "emerald" as const },
  { href: "/classification", title: "Text Classification & Naive Bayes", icon: Target, tone: "indigo" as const },
  { href: "/topic-modeling", title: "Unsupervised Topic Modeling", icon: Compass, tone: "violet" as const },
  { href: "/keywords", title: "Keyword & Keyphrase Extraction", icon: Key, tone: "sky" as const },
  { href: "/language-id", title: "Language Identification (Indic/Latin)", icon: Languages, tone: "amber" as const },
  { href: "/semantic-similarity", title: "Multi-Metric Semantic Similarity", icon: Sparkles, tone: "rose" as const },
];

const PIPELINE = [
  "Upload / Paste",
  "Preprocess",
  "Tokenize",
  "Filter",
  "Stem + Lemmatize",
  "Morphology",
  "POS Tag",
  "Chunk",
  "NER",
  "Sentiment",
  "Keywords",
  "N-Gram & Topics",
  "Word Cloud",
  "Report",
];

export default function HomePage() {

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#0b1026] px-6 py-14 text-white sm:px-12">
        <Badge tone="indigo" className="bg-white/10 text-indigo-200 ring-white/20">
          B.Tech Computer Engineering · Semester 7 · NLP Mini Project
        </Badge>
        <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          NLP-Based Intelligent Academic Document Analyzer{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">& Research Assistant</span>
        </h1>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-200">
          Understand. Analyze. Compare. Visualize.
        </p>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          A single, integrated web platform that runs real, locally-executed Natural Language Processing
          algorithms — tokenization, stemming, lemmatization, morphology, N-Grams, POS tagging, chunking,
          named entity recognition, TF-IDF similarity and word-cloud analytics — on any academic text or
          document you provide. No external AI APIs. No hardcoded results.
        </p>
        <div className="mt-8">
          <HomeCta />
        </div>
      </section>

      {/* PIPELINE */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">End-to-End NLP Processing Pipeline</h2>
        <Card className="overflow-x-auto p-5">
          <div className="flex min-w-max items-center gap-2">
            {PIPELINE.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                    {i + 1}
                  </span>
                  {step}
                </div>
                {i < PIPELINE.length - 1 && <ArrowRight size={14} className="text-slate-300" />}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* MODULES GRID */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Part I: Core Prescribed Modules</h2>
            <p className="text-xs text-slate-500">10 foundational practical modules from the academic syllabus</p>
          </div>
          <Link href="/experiments" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View Experiment Mapping →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_MODULES.map((e) => {
            const Icon = e.icon;
            return (
              <Link key={e.title} href={e.href}>
                <Card className="group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white">
                      <Icon size={17} />
                    </div>
                    <Badge tone={e.tone}>Core Practical</Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
                    Open module <ArrowRight size={12} />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Part II: Advanced NLP Laboratory Modules</h2>
            <p className="text-xs text-slate-500">Machine learning, multi-lingual evaluation, and semantic analytics</p>
          </div>
          <Link href="/experiments" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Advanced Specs →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANCED_MODULES.map((e) => {
            const Icon = e.icon;
            return (
              <Link key={e.title} href={e.href}>
                <Card className="group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md border-violet-100">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white">
                      <Icon size={17} />
                    </div>
                    <Badge tone={e.tone}>Advanced Lab</Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 transition group-hover:opacity-100">
                    Open module <ArrowRight size={12} />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TECH STACK */}
      <section>

        <h2 className="mb-4 text-lg font-semibold text-slate-900">Technology Stack</h2>
        <Card className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fullstack Runtime</p>
              <p className="mt-2 text-sm text-slate-700">Next.js (App Router) · TypeScript · Node.js server runtime</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">NLP Engine</p>
              <p className="mt-2 text-sm text-slate-700">winkNLP (POS/Entities) · compromise.js (NER) · natural (Porter Stemmer) · wink-lemmatizer · custom TF-IDF, N-Gram & chunking algorithms</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">UI</p>
              <p className="mt-2 text-sm text-slate-700">Tailwind CSS · lucide-react icons · responsive dashboard design</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
