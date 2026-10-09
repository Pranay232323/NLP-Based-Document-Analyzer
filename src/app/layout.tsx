import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { DocumentProvider } from "@/components/document-context";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "NLP Intelligence Platform | Academic Document Analyzer",
  description:
    "NLP-Based Intelligent Academic Document Analyzer and Research Assistant - a B.Tech CSE NLP mini project integrating tokenization, POS tagging, chunking, NER, N-Grams, TF-IDF similarity and word cloud analytics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <DocumentProvider>
          <AppShell>{children}</AppShell>
        </DocumentProvider>
      </body>
    </html>
  );
}
