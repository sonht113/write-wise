import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import HistoryList from "./HistoryList";

const CRITERIA_LABELS = {
  task_achievement: "Task Achievement",
  coherence_cohesion: "Coherence & Cohesion",
  lexical_resource: "Lexical Resource",
  grammar: "Grammar",
};

function StatCard({ title, value, subtitle, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-xs mt-1 opacity-70">{subtitle}</div>}
    </div>
  );
}

export default function ProgressDashboard({
  submissions,
  stats,
  onDeleteSubmission,
  onExport,
  onImport,
  onClearAll,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [viewingSubmission, setViewingSubmission] = useState(null);

  // Prepare chart data
  const chartData = submissions
    .slice(-10) // Last 10 submissions
    .map((sub, idx) => ({
      name: `#${idx + 1}`,
      date: new Date(sub.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      overall: sub.result?.band_score?.overall || 0,
      task_achievement: sub.result?.band_score?.task_achievement || 0,
      coherence_cohesion: sub.result?.band_score?.coherence_cohesion || 0,
      lexical_resource: sub.result?.band_score?.lexical_resource || 0,
      grammar: sub.result?.band_score?.grammar || 0,
    }));

  const handleViewSubmission = (submission) => {
    setViewingSubmission(submission);
    setActiveTab("detail");
  };

  const handleBackToList = () => {
    setViewingSubmission(null);
    setActiveTab("history");
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImport(event.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track your IELTS Writing Task 1 improvement over time
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          History ({submissions.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Submissions"
              value={stats?.totalSubmissions || 0}
              color="indigo"
            />
            <StatCard
              title="Average Score"
              value={stats?.averageScore?.toFixed(1) || "0.0"}
              subtitle="Band Score"
              color="green"
            />
            <StatCard
              title="Best Score"
              value={stats?.bestScore?.toFixed(1) || "0.0"}
              subtitle="Band Score"
              color="blue"
            />
            <StatCard
              title="Weakest Area"
              value={
                stats?.weakestCriterion
                  ? CRITERIA_LABELS[stats.weakestCriterion].split(" ")[0]
                  : "N/A"
              }
              subtitle={
                stats?.weakestCriterion
                  ? CRITERIA_LABELS[stats.weakestCriterion]
                  : "Complete a task first"
              }
              color="orange"
            />
          </div>

          {/* Progress Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Band Score Progress
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, 9]}
                    ticks={[0, 3, 6, 9]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    name="Overall"
                  />
                  <Line
                    type="monotone"
                    dataKey="task_achievement"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    name="TA"
                  />
                  <Line
                    type="monotone"
                    dataKey="coherence_cohesion"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    name="CC"
                  />
                  <Line
                    type="monotone"
                    dataKey="lexical_resource"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    name="LR"
                  />
                  <Line
                    type="monotone"
                    dataKey="grammar"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    name="Grammar"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Criteria Averages */}
          {stats?.criteriaAverages && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Average Scores by Criterion
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.criteriaAverages).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {CRITERIA_LABELS[key]}
                      </span>
                      <span className="font-bold text-indigo-600">
                        {value.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${(value / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Data Management
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onExport}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Export History (JSON)
              </button>
              <button
                onClick={handleImportClick}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Import History
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete all submissions? This cannot be undone.",
                    )
                  ) {
                    onClearAll();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <HistoryList
            submissions={submissions}
            onView={handleViewSubmission}
            onDelete={onDeleteSubmission}
          />
        </div>
      )}

      {/* Detail View */}
      {activeTab === "detail" && viewingSubmission && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleBackToList}
            className="mb-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to History
          </button>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {viewingSubmission.promptTitle}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(viewingSubmission.timestamp).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Overall</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {viewingSubmission.result?.band_score?.overall?.toFixed(1) ||
                    "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Task Achievement</div>
                <div className="text-2xl font-bold text-green-600">
                  {viewingSubmission.result?.band_score?.task_achievement?.toFixed(
                    1,
                  ) || "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Coherence</div>
                <div className="text-2xl font-bold text-blue-600">
                  {viewingSubmission.result?.band_score?.coherence_cohesion?.toFixed(
                    1,
                  ) || "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600">Lexical</div>
                <div className="text-2xl font-bold text-orange-600">
                  {viewingSubmission.result?.band_score?.lexical_resource?.toFixed(
                    1,
                  ) || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Your Answer ({viewingSubmission.wordCount} words)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {viewingSubmission.answer}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
