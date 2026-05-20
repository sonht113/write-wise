import { useState } from "react";

const CHART_TYPE_LABELS = {
  line: "Line Graph",
  bar: "Bar Chart",
  pie: "Pie Chart",
  table: "Table",
  process: "Process Diagram",
};

const CHART_TYPE_COLORS = {
  line: "bg-blue-100 text-blue-700",
  bar: "bg-green-100 text-green-700",
  pie: "bg-purple-100 text-purple-700",
  table: "bg-orange-100 text-orange-700",
  process: "bg-pink-100 text-pink-700",
};

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getBandColor(score) {
  if (score >= 8) return "text-green-600";
  if (score >= 7) return "text-blue-600";
  if (score >= 6) return "text-yellow-600";
  if (score >= 5) return "text-orange-600";
  return "text-red-600";
}

export default function HistoryList({ submissions, onView, onDelete }) {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No submissions yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by completing your first practice task.
        </p>
      </div>
    );
  }

  // Filter submissions
  let filtered = [...submissions];
  if (filter !== "all") {
    filtered = filtered.filter((s) => s.chartType === filter);
  }

  // Sort submissions
  if (sortBy === "date") {
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (sortBy === "score") {
    filtered.sort(
      (a, b) =>
        (b.result?.band_score?.overall || 0) -
        (a.result?.band_score?.overall || 0),
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({submissions.length})
          </button>
          {["line", "bar", "pie", "table"].map((type) => {
            const count = submissions.filter(
              (s) => s.chartType === type,
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === type
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {CHART_TYPE_LABELS[type]} ({count})
              </button>
            );
          })}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="date">Sort by Date</option>
          <option value="score">Sort by Score</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((submission) => {
          const score = submission.result?.band_score?.overall || 0;
          return (
            <div
              key={submission.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${CHART_TYPE_COLORS[submission.chartType]}`}
                    >
                      {CHART_TYPE_LABELS[submission.chartType]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(submission.timestamp)}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {submission.promptTitle ||
                      `Question ${submission.promptId}`}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {submission.answer.substring(0, 120)}...
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{submission.wordCount} words</span>
                    <span className={`font-bold ${getBandColor(score)}`}>
                      Band {score.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onView(submission)}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this submission?")) {
                        onDelete(submission.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && filter !== "all" && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No submissions found for {CHART_TYPE_LABELS[filter]}
        </div>
      )}
    </div>
  );
}
