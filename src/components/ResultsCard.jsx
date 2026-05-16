const CRITERIA_META = [
  { label: 'Task Achievement', key: 'task_achievement', color: 'indigo' },
  { label: 'Coherence & Cohesion', key: 'coherence_cohesion', color: 'blue' },
  { label: 'Lexical Resource', key: 'lexical_resource', color: 'emerald' },
  { label: 'Grammar', key: 'grammar', color: 'amber' },
]

function list(arr) {
  return Array.isArray(arr) && arr.length ? arr : null
}

function CriterionDetail({ criterion, feedback }) {
  if (!feedback) return null

  return (
    <details className="border border-gray-200 rounded-lg">
      <summary className="px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-gray-50 rounded-lg flex items-center gap-2">
        <span>{criterion.label}:</span>
        <span className="font-bold text-indigo-700">{feedback.score ?? '-'}</span>
      </summary>
      <div className="px-4 pb-3 space-y-2">
        {list(feedback.issues) && (
          <div>
            <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Issues</div>
            <ul className="text-sm text-gray-700 list-disc list-inside ml-1">
              {feedback.issues.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {list(feedback.fixes) && (
          <div>
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">How to Fix</div>
            <ul className="text-sm text-gray-700 list-disc list-inside ml-1">
              {feedback.fixes.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {list(feedback.rules) && (
          <div>
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Rule Reference</div>
            <ul className="text-sm text-purple-700 list-disc list-inside ml-1">
              {feedback.rules.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {feedback.explanation_vi && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Giải thích (Tiếng Việt)</div>
            <p className="text-sm text-gray-600 ml-1">{feedback.explanation_vi}</p>
          </div>
        )}
      </div>
    </details>
  )
}

function IssueCard({ title, items, color, itemRender }) {
  if (!items) return null
  const colorMap = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', itemText: 'text-red-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', itemText: 'text-orange-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', itemText: 'text-purple-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', itemText: 'text-blue-700' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', itemText: 'text-teal-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', itemText: 'text-green-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', itemText: 'text-amber-700' },
  }
  const c = colorMap[color] ?? colorMap.blue
  return (
    <div className={`mb-4 p-3 ${c.bg} border ${c.border} rounded-lg`}>
      <div className={`text-sm font-semibold ${c.text} mb-1`}>{title}</div>
      <ul className={`text-sm ${c.itemText} space-y-2 list-none ml-0`}>
        {items.map((item, i) => (
          <li key={i}>{itemRender ? itemRender(item, i) : (typeof item === 'string' ? item : JSON.stringify(item))}</li>
        ))}
      </ul>
    </div>
  )
}

export default function ResultsCard({ result }) {
  if (!result) return null

  const bs = result.band_score ?? {}

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="font-semibold text-lg mb-4">Feedback & Score</h2>

      {/* Score grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {CRITERIA_META.map((c) => (
          <div key={c.key} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
            <div className="text-2xl font-bold text-indigo-700">{bs[c.key] ?? '-'}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Overall */}
      <div className="flex items-center gap-3 mb-5 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="text-3xl font-bold text-indigo-700">{bs.overall ?? '-'}</div>
        <div className="font-semibold text-indigo-800">Overall Band Score</div>
      </div>

      {/* Detailed per-criterion feedback */}
      {CRITERIA_META.map((c) => (
        <div key={c.key} className="mb-3">
          <CriterionDetail criterion={c} feedback={result.criteria_feedback?.[c.key]} />
        </div>
      ))}

      {/* Strengths */}
      <IssueCard title="Strengths" items={list(result.strengths)} color="green" itemRender={(s) => s} />

      {/* Weaknesses */}
      <IssueCard title="Weaknesses" items={list(result.weaknesses)} color="amber" itemRender={(w) => w} />

      {/* Grammar errors with fix + explanation */}
      <IssueCard title="Grammar Errors" items={list(result.grammar_errors)} color="red"
        itemRender={(e) => (
          <div>
            <div><span className="font-medium">Error:</span> {e.error}</div>
            <div><span className="font-medium text-green-700">Fix:</span> {e.fix}</div>
            <div><span className="font-medium text-purple-700">Rule:</span> {e.rule}</div>
            {e.explanation_vi && <div className="text-gray-500 text-xs mt-0.5">{e.explanation_vi}</div>}
          </div>
        )}
      />

      {/* Vocabulary issues */}
      <IssueCard title="Vocabulary Issues" items={list(result.vocabulary_issues)} color="orange"
        itemRender={(v) => (
          <div>
            <div><span className="font-medium">Issue:</span> {v.issue}</div>
            <div><span className="font-medium text-green-700">Fix:</span> {v.fix}</div>
            <div><span className="font-medium text-purple-700">Rule:</span> {v.rule}</div>
            {v.explanation_vi && <div className="text-gray-500 text-xs mt-0.5">{v.explanation_vi}</div>}
          </div>
        )}
      />

      {/* Missing features */}
      <IssueCard title="Missing Features" items={list(result.missing_features)} color="purple" itemRender={(m) => m} />

      {/* Suggestions */}
      <IssueCard title="Suggestions" items={list(result.suggestions)} color="blue" itemRender={(s) => s} />

      {/* Improved sentences */}
      <IssueCard title="Improved Sentences" items={list(result.improved_sentences)} color="teal"
        itemRender={(s) => (
          <div>
            <div><span className="font-medium text-red-600">Original:</span> <span className="line-through">{s.original}</span></div>
            <div><span className="font-medium text-green-700">Improved:</span> {s.improved}</div>
            <div><span className="font-medium text-purple-700">Rule:</span> {s.rule}</div>
            {s.explanation_vi && <div className="text-gray-500 text-xs mt-0.5">{s.explanation_vi}</div>}
          </div>
        )}
      />
    </section>
  )
}
