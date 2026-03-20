"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { saveProfile } from "@/lib/storage";

const CONTENT_TYPE_OPTIONS = ["News", "Ideas", "Research", "Debate"];

interface SetupWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export default function SetupWizard({ onComplete, initialProfile }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState(initialProfile?.topic ?? "");
  const [contentTypes, setContentTypes] = useState<string[]>(
    initialProfile?.contentTypes ?? ["News", "Ideas"]
  );
  const [priorKnowledge, setPriorKnowledge] = useState(initialProfile?.priorKnowledge ?? "");
  const [volume, setVolume] = useState(initialProfile?.volume ?? 5);

  const steps = [
    {
      label: "What topic do you want to follow?",
      hint: 'Be specific. "AI policy in the EU" beats "AI". "Fermentation science" beats "food".',
      content: (
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. interpretability research in large language models"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none text-base"
            onKeyDown={(e) => e.key === "Enter" && topic.trim() && setStep(1)}
          />
        </div>
      ),
      canAdvance: topic.trim().length > 0,
    },
    {
      label: "What kind of content do you want?",
      hint: "Select everything that interests you.",
      content: (
        <div className="flex flex-wrap gap-3">
          {CONTENT_TYPE_OPTIONS.map((ct) => {
            const selected = contentTypes.includes(ct);
            return (
              <button
                key={ct}
                onClick={() =>
                  setContentTypes((prev) =>
                    selected ? prev.filter((x) => x !== ct) : [...prev, ct]
                  )
                }
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {ct}
              </button>
            );
          })}
        </div>
      ),
      canAdvance: contentTypes.length > 0,
    },
    {
      label: "What do you already know?",
      hint: "Help the curator skip the basics. The more specific, the better.",
      content: (
        <textarea
          autoFocus
          value={priorKnowledge}
          onChange={(e) => setPriorKnowledge(e.target.value)}
          placeholder="e.g. I understand transformers and RLHF at a technical level, but I'm not deep on interpretability methods specifically"
          rows={4}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none text-base resize-none"
        />
      ),
      canAdvance: priorKnowledge.trim().length > 0,
    },
    {
      label: "How many items per refresh?",
      hint: "Quality over quantity. 5 is a good starting point.",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>3</span>
            <span className="text-2xl font-semibold text-zinc-900">{volume}</span>
            <span>10</span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-zinc-900"
          />
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Fewer, more curated</span>
            <span>More variety</span>
          </div>
        </div>
      ),
      canAdvance: true,
    },
  ];

  const current = steps[step];

  function handleFinish() {
    const profile: UserProfile = { topic, contentTypes, priorKnowledge, volume };
    saveProfile(profile);
    onComplete(profile);
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">The Curator</h1>
          <p className="mt-1 text-sm text-zinc-500">Set up your personal content feed</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>

        {/* Step */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-medium text-zinc-900">{current.label}</h2>
            <p className="mt-1 text-sm text-zinc-500">{current.hint}</p>
          </div>

          {current.content}

          <div className="flex items-center justify-between pt-2">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!current.canAdvance}
                className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-30 hover:opacity-80"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!current.canAdvance}
                className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-30 hover:opacity-80"
              >
                Start curating →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
