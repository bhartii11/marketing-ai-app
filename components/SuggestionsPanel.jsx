"use client";

import SuggestionCard from "./SuggestionCard";

function SuggestionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="h-[52px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      ))}
    </div>
  );
}

export default function SuggestionsPanel({
  suggestions,
  selectedSuggestion,
  onSelect,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">AI Suggestions</h3>
      <p className="mt-1 text-sm text-slate-500">Click a suggestion to set or refine campaign goal.</p>

      <div className="mt-4">
        {loading ? (
          <SuggestionsSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suggestions.map((item) => (
              <SuggestionCard
                key={item}
                text={item}
                selected={selectedSuggestion === item}
                onClick={() => onSelect(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

