"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  SectionHeading,
  Badge,
  StatCard,
} from "@/components/ui/primitives";
import {
  LANGUAGE_REGISTRY,
  getSupportedLanguages,
  type LanguageCapability,
} from "@/lib/nlp/languageRegistry";
import { Globe, CheckCircle2, XCircle, AlertTriangle, Cpu, BookOpen } from "lucide-react";

export default function MultilingualPage() {
  const languages = getSupportedLanguages();
  const [selectedCode, setSelectedCode] = useState<string>("en");

  const currentLang = LANGUAGE_REGISTRY[selectedCode] || languages[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Architecture & Registry"
        title="Multilingual Capability Registry & Indic NLP Architecture"
        description="Structured language capability matrix for English, Hindi, and Marathi. Documents script handling, tokenization rules, resource requirements, and architectural roadmap for Indian language NLP expansion."
      />

      {/* LANGUAGE SELECTOR CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        {languages.map((lang) => {
          const isSelected = selectedCode === lang.code;
          return (
            <div
              key={lang.code}
              onClick={() => setSelectedCode(lang.code)}
              className={`cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{lang.name}</h3>
                  <p className="text-xs font-medium text-slate-500">{lang.nativeName} ({lang.code})</p>
                </div>
                <Badge
                  tone={
                    lang.status === "Fully Supported"
                      ? "emerald"
                      : lang.status === "Partially Supported"
                      ? "amber"
                      : "slate"
                  }
                >
                  {lang.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-1 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Script: </span>
                  {lang.script}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Supported Experiments: </span>
                  {lang.supportedExperiments.length} modules
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE LANGUAGE DETAILS */}
      <Card>
        <CardHeader
          title={`${currentLang.name} (${currentLang.nativeName}) — Capability Specification`}
          subtitle={`Unicode Range: ${currentLang.unicodeRange}`}
          action={
            <Badge tone="indigo" className="flex items-center gap-1">
              <Globe size={12} />
              ISO: {currentLang.code}
            </Badge>
          }
        />
        <CardBody className="space-y-6">
          {/* FEATURE SUPPORT MATRIX */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              NLP Pipeline Feature Support Matrix
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                {currentLang.stopwordSupport ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-slate-300" />
                )}
                <span className="font-medium text-slate-700">Stopwords</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                {currentLang.stemmingLemmatizationSupport ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-slate-300" />
                )}
                <span className="font-medium text-slate-700">Stemming / Lemma</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                {currentLang.posTaggingSupport ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-slate-300" />
                )}
                <span className="font-medium text-slate-700">POS Tagging</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                {currentLang.nerSupport ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-slate-300" />
                )}
                <span className="font-medium text-slate-700">NER</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                {currentLang.sentimentSupport ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <XCircle size={16} className="text-slate-300" />
                )}
                <span className="font-medium text-slate-700">Sentiment</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="font-medium text-slate-700">N-Gram & Similarity</span>
              </div>
            </div>
          </div>

          {/* ENGINE ARCHITECTURE */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
                <Cpu size={14} className="text-indigo-600" />
                Tokenization & Preprocessing Method
              </div>
              <p className="text-slate-600 leading-relaxed">{currentLang.tokenizationMethod}</p>

              <div className="mt-3 font-semibold text-slate-800">Required NLP Resources:</div>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-slate-600">
                {currentLang.requiredResources.map((res) => (
                  <li key={res}>{res}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-900 mb-1">
                <AlertTriangle size={14} className="text-amber-600" />
                Linguistic & Engineering Limitations
              </div>
              <ul className="mt-1 list-inside list-disc space-y-1 text-amber-800 leading-relaxed">
                {currentLang.knownLimitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ROADMAP & ARCHITECTURAL GUIDANCE */}
      <Card>
        <CardHeader
          title="Indian Language NLP Expansion Architecture"
          subtitle="Engineering blueprint for integrating Marathi and Hindi NLP resources"
        />
        <CardBody className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-start gap-3 rounded-xl bg-indigo-50/70 p-4 text-indigo-900">
            <BookOpen size={18} className="mt-0.5 shrink-0 text-indigo-600" />
            <div className="space-y-2">
              <p className="font-semibold text-indigo-950">Architectural Rule for Indic Expansion:</p>
              <p>
                English NLP resources (Porter Stemmer, WordNet lemmatizers, English NLTK stopwords, Penn Treebank tagsets)
                must NEVER be applied directly to Devanagari text. Doing so produces corrupted roots and meaningless classifications.
              </p>
              <p>
                Future releases incorporate Indic NLP Suite modules, character-level conjunct segmenters (NFC/NFD Unicode normalization),
                and morphological analyzers that handle Marathi postpositions (विभक्ती प्रत्यय) and Hindi grammatical case markers.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
