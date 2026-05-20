import { useState, useEffect, useMemo } from "react";
import sampleEssays from "../data/sampleEssays";
import SampleEssayCard from "./SampleEssayCard";
import AnnotatedAnswer from "./AnnotatedAnswer";

const CHART_TYPES = [
  { value: "all", label: "All" },
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "table", label: "Table" },
];

const BAND_FILTERS = [
  { value: "all", label: "All Bands" },
  { value: "low", label: "6.0–6.5" },
  { value: "mid", label: "7.0–7.5" },
  { value: "high", label: "8.0+" },
];

function getBandColor(band) {
  if (band >= 8.0) return "bg-green-100 text-green-800 border-green-300";
  if (band >= 7.0) return "bg-blue-100 text-blue-800 border-blue-300";
  return "bg-yellow-100 text-yellow-800 border-yellow-300";
}

function getChartTypeLabel(chartType) {
  const labels = {
    line: "Line Graph",
    bar: "Bar Chart",
    pie: "Pie Chart",
    table: "Table",
  };
  return labels[chartType] || chartType;
}

export default function SampleEssaysModal({
  isOpen,
  onClose,
  initialChartType,
}) {
  const [chartFilter, setChartFilter] = useState("all");
  const [bandFilter, setBandFilter] = useState("all");
  const [selectedEssay, setSelectedEssay] = useState(null);
  const [prevOpen, setPrevOpen] = useState(false);

  if (isOpen && !prevOpen) {
    if (initialChartType) setChartFilter(initialChartType);
    setPrevOpen(true);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    return sampleEssays.filter((essay) => {
      if (chartFilter !== "all" && essay.chartType !== chartFilter)
        return false;
      if (
        bandFilter === "low" &&
        (essay.bandScore < 6.0 || essay.bandScore > 6.5)
      )
        return false;
      if (
        bandFilter === "mid" &&
        (essay.bandScore < 7.0 || essay.bandScore > 7.5)
      )
        return false;
      if (bandFilter === "high" && essay.bandScore < 8.0) return false;
      return true;
    });
  }, [chartFilter, bandFilter]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Sample Essays
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Filter bar */}
          {!selectedEssay && (
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex gap-1">
                {CHART_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setChartFilter(ct.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                      chartFilter === ct.value
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 ml-auto">
                {BAND_FILTERS.map((bf) => (
                  <button
                    key={bf.value}
                    onClick={() => setBandFilter(bf.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                      bandFilter === bf.value
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {bf.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedEssay ? (
            <EssayDetail
              essay={selectedEssay}
              onBack={() => setSelectedEssay(null)}
            />
          ) : (
            <>
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No essays match the selected filters.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((essay) => (
                    <SampleEssayCard
                      key={essay.id}
                      essay={essay}
                      onClick={setSelectedEssay}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EssayDetail({ essay, onBack }) {
  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-4 cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to all essays
      </button>

      {/* Title and meta */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {essay.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border ${getBandColor(essay.bandScore)}`}
          >
            Band {essay.bandScore.toFixed(1)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            {getChartTypeLabel(essay.chartType)}
          </span>
          <span className="text-xs text-gray-400">{essay.wordCount} words</span>
        </div>
      </div>

      {/* Annotation legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-400" />{" "}
          Đúng & tốt
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-400" />{" "}
          Có thể cải thiện
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-400" />{" "}
          Cần sửa
        </span>
      </div>

      {/* Essay text with annotations */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <AnnotatedAnswer text={essay.essay} annotations={essay.annotations} />
      </div>

      {/* Strengths */}
      {essay.strengths?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Strengths
          </h4>
          <div className="flex flex-wrap gap-2">
            {essay.strengths.map((s, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Techniques */}
      {essay.keyTechniques?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Key Techniques
          </h4>
          <div className="flex flex-wrap gap-2">
            {essay.keyTechniques.map((t, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
