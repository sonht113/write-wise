import { useState, useEffect } from "react";
import ChartRenderer from "./charts/ChartRenderer";
import ResultsCard from "./ResultsCard";
import PromptSelector from "./PromptSelector";
import GrammarPanel from "./GrammarPanel";
import useGrammarCheck from "../hooks/useGrammarCheck";

export default function PracticeView({
  visiblePrompts,
  currentPrompt,
  chartData,
  onSelectPrompt,
  onUpdateChart,
  onShowSamples,
  answer,
  onAnswerChange,
  loading,
  result,
  error,
  wordCount,
  onSubmit,
  onReset,
  autoSaveStatus,
  autoSaveLastSaved,
  draftBanner,
  onResumeDraft,
  onDiscardDraft,
}) {
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const grammar = useGrammarCheck(answer);

  useEffect(() => {
    if (!timerOn || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerOn, timeLeft]);

  const toggleTimer = () => {
    if (timerOn) {
      setTimerOn(false);
      setTimeLeft(1200);
    } else {
      setTimeLeft(1200);
      setTimerOn(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6 min-w-0">
        {/* Draft Recovery Banner */}
        {draftBanner && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-amber-800">
                Bạn có bản nháp chưa hoàn thành
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Lưu lúc{" "}
                {new Date(draftBanner.timestamp).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onResumeDraft}
                className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer"
              >
                Tiếp tục viết
              </button>
              <button
                onClick={onDiscardDraft}
                className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 cursor-pointer"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        {/* Prompt */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Prompt</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onShowSamples}
                className="text-sm text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 cursor-pointer font-medium"
              >
                View Samples
              </button>
              <PromptSelector
                prompts={visiblePrompts}
                currentPrompt={currentPrompt}
                onSelect={onSelectPrompt}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentPrompt.description}
          </p>
          <p className="text-sm text-gray-500 italic mt-2">
            {currentPrompt.task}
          </p>
          <div className="mt-4">
            <ChartRenderer prompt={chartData} onUpdate={onUpdateChart} />
          </div>
        </section>

        {/* Answer */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Your Answer</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={grammar.enabled}
                  onChange={grammar.toggleEnabled}
                  className="cursor-pointer"
                />
                Grammar
                {grammar.enabled && grammar.errors.length > 0 && (
                  <span className="ml-0.5 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                    {grammar.errors.length}
                  </span>
                )}
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={timerOn}
                  onChange={toggleTimer}
                  className="cursor-pointer"
                />
                Timer
              </label>
              {timerOn && (
                <span
                  className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 60 ? "text-red-600" : "text-indigo-600"}`}
                >
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </span>
              )}
              <span className="text-sm font-medium text-gray-500">
                {wordCount} words
              </span>
            </div>
          </div>
          <textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your Task 1 answer here..."
            rows={10}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-0 focus:border-indigo-500 resize-y"
            disabled={loading}
          />
          {/* Grammar Panel */}
          {grammar.enabled && !loading && (
            <GrammarPanel
              errors={grammar.errors}
              onFix={(error) => {
                const before = answer.slice(0, error.start);
                const after = answer.slice(error.end);
                onAnswerChange(before + error.suggestion + after);
              }}
              onFixAll={() => {
                // Apply fixes from end to start to preserve positions
                let fixed = answer;
                const sorted = [...grammar.errors].sort(
                  (a, b) => b.start - a.start,
                );
                for (const error of sorted) {
                  fixed =
                    fixed.slice(0, error.start) +
                    error.suggestion +
                    fixed.slice(error.end);
                }
                onAnswerChange(fixed);
              }}
            />
          )}
          <div className="flex gap-3 mt-3">
            <button
              onClick={onSubmit}
              disabled={loading || !answer.trim()}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? "Analyzing..." : "Submit for Analysis"}
            </button>
            <button
              onClick={onReset}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {/* Auto-save status */}
          {answer.trim() && autoSaveStatus !== "idle" && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              {autoSaveStatus === "saving" && (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Đang lưu...</span>
                </>
              )}
              {autoSaveStatus === "saved" && autoSaveLastSaved && (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>
                    Đã lưu lúc{" "}
                    {autoSaveLastSaved.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="lg:w-105 xl:w-120 shrink-0">
        <div className="lg:sticky lg:top-6">
          <ResultsCard
            result={result}
            wordCount={wordCount}
            answer={answer}
            loading={loading}
            onReset={onReset}
            promptTitle={currentPrompt.title}
            chartType={currentPrompt.chartType}
          />
        </div>
      </div>
    </div>
  );
}
