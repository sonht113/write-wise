import { useState } from "react";

const severityStyles = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    text: "text-red-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
  },
};

export default function GrammarPanel({ errors, onFix, onFixAll }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!errors || errors.length === 0) return null;

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  return (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${collapsed ? "" : "rotate-90"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Grammar Issues
          </span>
          {errorCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
              {errorCount} {errorCount === 1 ? "error" : "errors"}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              {warningCount} {warningCount === 1 ? "suggestion" : "suggestions"}
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFixAll();
            }}
            className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer font-medium"
          >
            Fix All
          </button>
        )}
      </div>

      {/* Error list */}
      {!collapsed && (
        <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-100">
          {errors.map((error) => {
            const styles =
              severityStyles[error.severity] || severityStyles.error;
            return (
              <div
                key={error.id}
                className={`px-4 py-2.5 ${styles.bg} flex items-start gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${styles.badge}`}
                    >
                      {error.severity}
                    </span>
                    <span className="text-xs text-gray-400">
                      {error.category}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={`${styles.text} line-through`}>
                      {error.original}
                    </span>
                    <span className="text-gray-400 mx-1.5">→</span>
                    <span className="text-green-700 font-medium">
                      {error.suggestion}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{error.rule}</p>
                </div>
                <button
                  onClick={() => onFix(error)}
                  className="shrink-0 text-xs px-2 py-1 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 cursor-pointer font-medium"
                >
                  Fix
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
