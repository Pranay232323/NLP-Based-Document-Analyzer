"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  SplitSquareHorizontal,
  Blocks,
  TextCursorInput,
  Tags,
  Network,
  ScanSearch,
  GitCompareArrows,
  Cloud,
  ClipboardList,
  Info,
  ListChecks,
  Menu,
  X,
  Brain,
  Smile,
  Target,
  Compass,
  Key,
  Languages,
  Sparkles,
  History,
} from "lucide-react";
import { useDocument } from "@/components/document-context";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Home", icon: LayoutDashboard },
      { href: "/analyzer", label: "Document Analyzer", icon: FileText },
      { href: "/dashboard", label: "NLP Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "NLP TOOLS",
    items: [
      { href: "/preprocessing", label: "Text Preprocessing", icon: SplitSquareHorizontal },
      { href: "/stemlemma", label: "Stemming & Lemmatization", icon: TextCursorInput },
      { href: "/morphology", label: "Morphology Analyzer", icon: Blocks },
      { href: "/ngram", label: "N-Gram Lab", icon: Network },
      { href: "/pos", label: "POS Tagger", icon: Tags },
      { href: "/chunking", label: "Chunk Analyzer", icon: ScanSearch },
      { href: "/ner", label: "Named Entity Recognition", icon: ScanSearch },
      { href: "/similarity", label: "Document Similarity", icon: GitCompareArrows },
      { href: "/wordcloud", label: "Word Cloud & Text Analytics", icon: Cloud },
    ],
  },
  {
    label: "ADVANCED NLP LAB",
    items: [
      { href: "/sentiment", label: "Sentiment Analysis", icon: Smile },
      { href: "/classification", label: "Text Classification", icon: Target },
      { href: "/topic-modeling", label: "Topic Modeling", icon: Compass },
      { href: "/keywords", label: "Keyword Extraction", icon: Key },
      { href: "/language-id", label: "Language Identification", icon: Languages },
      { href: "/semantic-similarity", label: "Semantic Similarity", icon: Sparkles },
    ],
  },
  {
    label: "Academic & Tracking",
    items: [
      { href: "/report", label: "Final NLP Report", icon: ClipboardList },
      { href: "/experiments", label: "Experiment Mapping", icon: ListChecks },
      { href: "/multilingual", label: "Multilingual Registry", icon: Languages },
      { href: "/history", label: "Experiment History", icon: History },
      { href: "/about", label: "About Project", icon: Info },
    ],
  },
];


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { docName, analysis } = useDocument();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0b1026] text-slate-200">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
          <Brain size={18} />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">NLP Intelligence</p>
          <p className="text-[11px] leading-tight text-slate-400">Platform</p>
        </div>
      </div>

      <div className="mx-4 mb-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs">
        <p className="text-slate-400">Active document</p>
        <p className="mt-0.5 truncate font-medium text-slate-100">{docName || "No document selected"}</p>
        <p className="mt-0.5 text-[11px] text-emerald-400">{analysis ? `${analysis.meta.stats.wordCount} words analyzed` : "0 words analyzed"}</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                      active
                        ? "bg-gradient-to-r from-indigo-600/90 to-violet-600/80 font-medium text-white shadow"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-[11px] text-slate-500">
        B.Tech CSE · Sem 7 · NLP Mini Project
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">{sidebar}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Brain size={16} />
            </div>
            <span className="text-sm font-bold text-slate-900">NLP Intelligence Platform</span>
          </div>
          <button onClick={() => setMobileOpen((v) => !v)} className="rounded-lg border border-slate-200 p-2">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
