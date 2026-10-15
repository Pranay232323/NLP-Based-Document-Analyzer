"use client";

import { useState, useEffect, useRef } from "react";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/primitives";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Sparkles, HelpCircle, Layers } from "lucide-react";

export interface SimulationStep {
  tokenIndex?: number;
  highlightIndices?: number[]; // e.g., for n-gram window [0, 1] or chunk phrases
  label: string;
  ruleApplied: string;
  explanation: string;
  stateSnapshot?: Record<string, string | number | boolean>;
  badge?: {
    text: string;
    tone?: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate";
  };
  accumulatedPreview?: string[];
}

export interface StepSimulatorProps {
  title: string;
  subtitle?: string;
  tokens: string[];
  steps: SimulationStep[];
  badgeText?: string;
  defaultSpeed?: number; // in ms per step, default 1600
}

export function StepSimulator({
  title,
  subtitle = "Step-by-step visual algorithm execution for students & evaluators",
  tokens,
  steps,
  badgeText = "Live Algorithm Simulator",
  defaultSpeed = 1600,
}: StepSimulatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 0.5 | 2>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = steps.length;
  const stepData = steps[currentStep] || steps[0];

  // Handle auto-play
  useEffect(() => {
    if (isPlaying && totalSteps > 1) {
      const intervalMs = defaultSpeed / speedMultiplier;
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, defaultSpeed, speedMultiplier]);

  function handlePlayPause() {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function handleNext() {
    setIsPlaying(false);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrev() {
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleReset() {
    setIsPlaying(false);
    setCurrentStep(0);
  }

  if (!steps || steps.length === 0) {
    return null;
  }

  const activeIndices = new Set<number>();
  if (stepData?.highlightIndices && stepData.highlightIndices.length > 0) {
    stepData.highlightIndices.forEach((i) => activeIndices.add(i));
  } else if (stepData?.tokenIndex !== undefined) {
    activeIndices.add(stepData.tokenIndex);
  }

  return (
    <Card className="border-indigo-200/90 bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/30 shadow-md">
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="indigo" className="flex items-center gap-1 font-semibold">
              <Sparkles size={12} />
              {badgeText}
            </Badge>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono font-bold text-slate-700">
              Step {currentStep + 1} / {totalSteps}
            </span>
          </div>
        }
      />

      <CardBody className="space-y-5">
        {/* PLAYER CONTROLS TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-white/90 p-3 shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
              title="Previous Step"
            >
              <SkipBack size={16} />
            </button>

            <button
              type="button"
              onClick={handlePlayPause}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              {isPlaying ? "Pause" : currentStep >= totalSteps - 1 ? "Replay" : "Simulate"}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep >= totalSteps - 1}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
              title="Next Step"
            >
              <SkipForward size={16} />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              title="Reset Simulator"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* PROGRESS SLIDER */}
          <div className="flex flex-1 items-center gap-3 px-2 min-w-[140px] max-w-xs">
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={currentStep}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStep(Number(e.target.value));
              }}
              className="h-1.5 w-full cursor-pointer accent-indigo-600"
            />
          </div>

          {/* SPEED SELECTOR */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Speed:</span>
            {([0.5, 1, 2] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSpeedMultiplier(spd)}
                className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
                  speedMultiplier === spd
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* TOKEN STREAM WITH ACTIVE SCANNER POINTER */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-600">
              Input Token Sequence:
            </span>
            <span className="text-[11px]">
              Active index: <code className="font-mono text-indigo-700">{stepData?.tokenIndex ?? "N/A"}</code>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {tokens.map((token, idx) => {
              const isActive = activeIndices.has(idx);
              return (
                <div key={idx} className="relative flex flex-col items-center">
                  <span
                    onClick={() => {
                      setIsPlaying(false);
                      // Jump to corresponding step if available
                      const matchingStep = steps.findIndex((s) => s.tokenIndex === idx);
                      if (matchingStep !== -1) setCurrentStep(matchingStep);
                    }}
                    className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-300 select-none ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-300 scale-105 ring-2 ring-indigo-400 ring-offset-1 font-bold"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {token}
                  </span>

                  {isActive && (
                    <span className="absolute -top-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP INSPECTION: RULE, EXPLANATION & INTERNAL STATE */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* STEP EXPLANATION CARD */}
          <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Action: {stepData?.label}
              </h4>
              {stepData?.badge && (
                <Badge tone={stepData.badge.tone ?? "indigo"}>
                  {stepData.badge.text}
                </Badge>
              )}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Rule / Transformation:</p>
              <div className="mt-1 rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-800 border border-slate-100">
                {stepData?.ruleApplied}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                <HelpCircle size={13} className="text-indigo-600" />
                <span>Textbook Academic Insight:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-50">
                {stepData?.explanation}
              </p>
            </div>
          </div>

          {/* INTERNAL STATE & ACCUMULATOR */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-600" />
                Internal State & Memory
              </h4>
              <span className="text-[10px] text-slate-400">Step Snapshot</span>
            </div>

            {stepData?.stateSnapshot && Object.keys(stepData.stateSnapshot).length > 0 ? (
              <div className="space-y-1.5">
                {Object.entries(stepData.stateSnapshot).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs border-b border-slate-50 py-1">
                    <span className="font-semibold text-slate-600">{key}:</span>
                    <span className="font-mono font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No complex state memory for this operation.</p>
            )}

            {stepData?.accumulatedPreview && stepData.accumulatedPreview.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Accumulated Output ({stepData.accumulatedPreview.length}):
                </p>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {stepData.accumulatedPreview.map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-800 border border-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
