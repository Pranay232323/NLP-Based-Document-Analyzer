import { Card, CardBody, CardHeader, SectionHeading, Badge } from "@/components/ui/primitives";

const APPLICATIONS = [
  "Machine Translation (e.g. Google Translate)",
  "Chatbots & Virtual Assistants (e.g. Siri, Alexa)",
  "Sentiment Analysis for product/social media reviews",
  "Spam & Toxic Content Detection",
  "Text Summarization",
  "Information Retrieval & Search Engines",
  "Speech Recognition & Text-to-Speech",
  "Grammar & Spell Checking",
  "Named Entity Recognition for information extraction",
  "Plagiarism / Text Similarity Detection",
];

const TECHNIQUES = [
  "Tokenization & Text Normalization",
  "Stop Word Removal",
  "Stemming (Porter Algorithm)",
  "Lemmatization (POS-aware WordNet-style)",
  "Morphological Analysis",
  "N-Gram Language Modelling",
  "Part-of-Speech Tagging",
  "Rule-based Chunking (Shallow Parsing)",
  "Named Entity Recognition",
  "TF-IDF Vectorization & Cosine Similarity",
  "Word Frequency Analysis / EDA",
];

const TOOLS = [
  "Next.js (App Router) + TypeScript",
  "Node.js runtime (server-side NLP execution)",
  "winkNLP — POS tagging & statistical entity recognition",
  "compromise.js — lexicon/rule-based NER (Person/Org/Place)",
  "natural — Porter Stemmer",
  "wink-lemmatizer — WordNet-style lemmatization",
  "pdf-parse — PDF text extraction",
  "Custom TF-IDF, Cosine Similarity, N-Gram & Chunking implementations",
  "Tailwind CSS + lucide-react — UI",
];

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Documentation" title="About the Project" description="NLP Applications, Problem Statement & Project Objectives." />

      <Card>
        <CardHeader title="Project Title" />
        <CardBody>
          <p className="text-lg font-semibold text-slate-900">NLP-Based Intelligent Academic Document Analyzer and Research Assistant</p>
          <p className="mt-1 text-sm text-slate-500">Short name: NLP Intelligence Platform</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="What is NLP?" />
        <CardBody>
          <p className="text-sm leading-relaxed text-slate-600">
            Natural Language Processing (NLP) is a branch of Artificial Intelligence and Computational Linguistics that
            enables computers to read, understand, interpret and generate human language. NLP combines techniques from
            linguistics, computer science and machine learning to process text and speech data — ranging from simple
            tokenization to deep semantic understanding.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Applications of NLP" />
        <CardBody>
          <div className="grid gap-2 sm:grid-cols-2">
            {APPLICATIONS.map((a) => (
              <div key={a} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" /> {a}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Problem Statement" />
        <CardBody>
          <p className="text-sm leading-relaxed text-slate-600">
            Academic documents contain large amounts of textual information. Manually analyzing their linguistic
            structure, extracting entities, identifying important terms, comparing documents and understanding their
            textual patterns is time-consuming. The proposed system applies multiple NLP techniques to automatically
            process and analyze academic text through a unified platform.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Project Objectives" />
        <CardBody>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
            <li>Apply fundamental NLP preprocessing techniques (tokenization, filtration, script validation).</li>
            <li>Compare stop-word removal, stemming and lemmatization outcomes.</li>
            <li>Analyze word structure through rule-based morphological analysis and generation.</li>
            <li>Predict and generate text using statistical N-Gram models.</li>
            <li>Perform Part-of-Speech tagging on academic text.</li>
            <li>Identify phrases (NP/VP/PP) using rule-based chunking.</li>
            <li>Extract named entities (people, organizations, locations, dates, etc.).</li>
            <li>Measure document similarity using TF-IDF and Cosine Similarity.</li>
            <li>Visualize important terms using Word Cloud and frequency analytics.</li>
            <li>Provide an integrated, automatically generated NLP analysis report.</li>
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="NLP Techniques Used" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUES.map((t) => (
              <Badge key={t} tone="indigo">{t}</Badge>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Tools & Technologies Used" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <Badge key={t} tone="violet">{t}</Badge>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
