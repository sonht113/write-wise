import { useState, useRef, useEffect } from "react";

const CHART_TYPES = ["all", "line", "bar", "pie", "table"];
const DIFFICULTIES = ["all", "easy", "medium", "hard"];

const chartTypeColors = {
  line: "bg-indigo-100 text-indigo-700",
  bar: "bg-orange-100 text-orange-700",
  pie: "bg-emerald-100 text-emerald-700",
  table: "bg-purple-100 text-purple-700",
  process: "bg-gray-100 text-gray-700",
};

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function PromptSelector({ prompts, currentPrompt, onSelect }) {
  const [open, setOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const filtered = prompts.filter((p) => {
    if (chartFilter !== "all" && p.chartType !== chartFilter) return false;
    if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter)
      return false;
    return true;
  });

  const handleSelect = (prompt) => {
    onSelect(prompt.id);
    setOpen(false);
  };

  const handleRandom = () => {
    if (filtered.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    handleSelect(filtered[randomIndex]);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer max-w-[280px]"
      >
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${chartTypeColors[currentPrompt.chartType] || "bg-gray-100 text-gray-700"}`}
        >
          {currentPrompt.chartType}
        </span>
        <span className="truncate text-gray-700">{currentPrompt.title}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 mt-2 w-[380px] bg-white rounded-lg shadow-lg border border-gray-200 z-20 flex flex-col"
        >
          {/* Filters */}
          <div className="p-3 border-b border-gray-100 space-y-2">
            {/* Chart type filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-500 mr-1">Type:</span>
              {CHART_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setChartFilter(type)}
                  className={`text-xs px-2 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    chartFilter === type
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "all"
                    ? "All"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            {/* Difficulty filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-500 mr-1">Level:</span>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`text-xs px-2 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    difficultyFilter === diff
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {diff === "all"
                    ? "All"
                    : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Counter + Random */}
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
            <span className="text-xs text-gray-500">
              {filtered.length} of {prompts.length} questions
            </span>
            <button
              onClick={handleRandom}
              disabled={filtered.length === 0}
              className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium hover:bg-indigo-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎲 Random
            </button>
          </div>

          {/* Prompt list */}
          <div className="max-h-[400px] overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No matching prompts
              </p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-2 cursor-pointer transition-colors ${
                    p.id === currentPrompt.id
                      ? "bg-indigo-50 border border-indigo-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${chartTypeColors[p.chartType]}`}
                  >
                    {p.chartType}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${difficultyColors[p.difficulty]}`}
                  >
                    {p.difficulty}
                  </span>
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {p.title}
                  </span>
                  {p.topic && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {p.topic}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
