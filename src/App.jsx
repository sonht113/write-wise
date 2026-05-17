import { useState, useEffect } from "react";
import prompts from "./prompts";
import rulebook from "./docs/ielts_writing_task_1_master_rulebook.md?raw";

const visiblePrompts = prompts.filter((p) => p.chartType !== "process");
import ChartRenderer from "./components/charts/ChartRenderer";
import ResultsCard from "./components/ResultsCard";
import ModelSelector from "./components/ModelSelector";
import ApiKeyModal from "./components/ApiKeyModal";

const SYSTEM_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

function getDynamicDescription(data) {
  switch (data?.chartType) {
    case 'line': {
      const n = data.lines?.length ?? 0
      const labels = data.data?.map((r) => r[data.xAxisKey]).filter(Boolean) ?? []
      return `The line graph shows ${data.yAxisLabel ?? 'data'} for ${n} data series from ${labels[0] ?? '?'} to ${labels[labels.length - 1] ?? '?'}.`
    }
    case 'bar': {
      const n = data.data?.length ?? 0
      const groups = data.bars?.length ?? 0
      return `The bar chart shows ${data.yAxisLabel ?? 'percentages'} for ${n} categories across ${groups} time periods.`
    }
    case 'pie': {
      const years = data.pieData?.length ?? 0
      const segments = data.pieData?.[0]?.data?.length ?? 0
      return `The pie charts show ${segments} categories of spending in ${years} different years.`
    }
    case 'table': {
      const countries = data.tableData?.length ?? 0
      const years = Object.keys(data.tableData?.[0] ?? {}).filter((k) => k !== 'country')
      return `The table shows data for ${countries} countries from ${years[0] ?? '?'} to ${years[years.length - 1] ?? '?'}.`
    }
    default:
      return data?.description ?? ''
  }
};

const SYSTEM_PROMPT = `You are an expert IELTS examiner and writing tutor. Evaluate the student's IELTS Writing Task 1 answer.

Follow the rules below strictly when scoring and providing feedback:

${rulebook}

RESPONSE REQUIREMENTS:
- Respond in valid JSON only.
- For every issue detected, reference the specific rule section (e.g., "Section 3.1", "Section 5.1").
- Include Vietnamese explanations (explanation_vi) so students can understand the feedback clearly.
- For each criterion, provide detailed issue analysis, how to fix it, and why (rule-based).
- Generate an "annotations" array to provide word-by-word or phrase-by-phrase inline feedback on the student's answer. Annotate as many segments as possible. Each annotation must have a "type" field with one of three values:
  "correct" — The phrasing is both accurate AND well-chosen for IELTS Task 1. No suggestion needed. Highlight green to reinforce good usage (e.g., proper use of "stood at", "accounted for", "witnessed", correct tense, good collocations).
  "improvement" — The phrasing is grammatically correct but could be more natural, precise, academic, or varied based on the rulebook (Sections 5-14). Show the improved version in parentheses. Highlight yellow (e.g., "went up" → "rose", "a lot of" → "a significant amount of", repetitive vocabulary, simple structures that could be upgraded).
  "incorrect" — The phrasing contains an error that must be fixed. This includes: wrong noun form (countable/uncountable, pluralization), wrong verb form (tense, irregular verb, verb after preposition), wrong adjective/adverb usage (adjective modifying verb, double comparative), wrong preposition (time, comparison, data prepositions), wrong article (a/an/the), subject-verb disagreement, or any grammar mistake from Section 16. Show the corrected version in parentheses. Highlight red (e.g., "between 2000 to 2020" → "between 2000 and 2020", "increased significant" → "increased significantly", "the number of user" → "the number of users").

Use this JSON structure:
{
  "band_score": {
    "task_achievement": 6.0,
    "coherence_cohesion": 6.5,
    "lexical_resource": 6.0,
    "grammar": 5.5,
    "overall": 6.0
  },
  "criteria_feedback": {
    "task_achievement": {
      "score": 6.0,
      "issues": ["Overview is missing"],
      "fixes": ["Add 1-2 sentences summarizing the main trend before going into details"],
      "rules": ["Section 3.1 — Overview is the most important section"],
      "explanation_vi": "Bạn chưa có overview. Theo Section 3.1, overview là phần quan trọng nhất trong Task 1, cần tóm tắt xu hướng chính."
    },
    "coherence_cohesion": {
      "score": 6.5,
      "issues": ["Lack of linking words between sentences"],
      "fixes": ["Use 'while', 'whereas', 'in contrast' to connect contrasting data"],
      "rules": ["Section 14 — Linking word rules", "Section 8.4 — While/Whereas structures"],
      "explanation_vi": "Bài viết thiếu từ nối giữa các câu. Theo Section 14, cần sử dụng linking words để tăng tính mạch lạc."
    },
    "lexical_resource": {
      "score": 6.0,
      "issues": ["Repetitive vocabulary: 'increase' used 4 times"],
      "fixes": ["Use synonyms: 'rise', 'grow', 'surge', 'soar' (Section 5.1)"],
      "rules": ["Section 5.1 — Increase vocabulary", "Section 6 — Adjectives & Adverbs"],
      "explanation_vi": "Từ 'increase' bị lặp lại nhiều lần. Section 5.1 cung cấp nhiều từ đồng nghĩa như 'rise', 'surge', 'soar' để bạn đa dạng hóa vốn từ."
    },
    "grammar": {
      "score": 5.5,
      "issues": ["Incorrect tense: 'the number of users increase' (should be 'increased')"],
      "fixes": ["Use past tense (V2) for historical data: 'increased', 'stood at', 'declined' (Section 13)"],
      "rules": ["Section 13 — Tense rules", "Section 15 — Common mistakes detection"],
      "explanation_vi": "Dữ liệu trong quá khứ cần dùng thì quá khứ. Section 13 yêu cầu sử dụng V2 cho dữ liệu đã qua."
    }
  },
  "annotations": [
    {
      "original": "the line graph",
      "improved": "the provided chart",
      "type": "improvement",
      "explanation_vi": "Mặc dù 'the line graph' đúng, nhưng 'the provided chart' nghe chuyên nghiệp và trang trọng hơn cho IELTS Writing Task 1."
    },
    {
      "original": "illustrated",
      "improved": "illustrates",
      "type": "incorrect",
      "explanation_vi": "Dữ liệu bao gồm cả quá khứ và dự báo tương lai, nên dùng thì hiện tại (present simple) thay vì quá khứ."
    },
    {
      "original": "U.S. energy consumption",
      "improved": "energy use in the United States",
      "type": "improvement",
      "explanation_vi": "Có thể paraphrase 'U.S. energy consumption' thành 'energy use in the United States' để tránh lặp từ với đề bài."
    },
    {
      "original": "six fuel types",
      "improved": "six different fuel categories",
      "type": "improvement",
      "explanation_vi": "'six different fuel categories' nghe học thuật hơn 'six fuel types'."
    },
    {
      "original": "between 1980 to 2030",
      "improved": "from 1980 to 2030",
      "type": "incorrect",
      "explanation_vi": "'Between... to...' là sai ngữ pháp. Đúng phải là 'between... and...' hoặc 'from... to...'."
    },
    {
      "original": "2030.",
      "improved": "2030, including projected figures.",
      "type": "improvement",
      "explanation_vi": "Nên thêm 'including projected figures' để làm rõ rằng số liệu bao gồm cả dự báo."
    }
  ],
  "strengths": ["Good overview", "Clear paragraph structure"],
  "weaknesses": ["Repetitive vocabulary", "Limited complex sentences"],
  "grammar_errors": [
    { "error": "the number of users increase", "fix": "the number of users increased", "rule": "Section 13 — Past data must use V2", "explanation_vi": "Dữ liệu năm 2000-2020 là quá khứ, động từ phải chia ở thì quá khứ." }
  ],
  "vocabulary_issues": [
    { "issue": "'increase' used 4 times", "fix": "Replace with 'rise', 'grow', 'surge'", "rule": "Section 5.1", "explanation_vi": "Lặp từ làm giảm điểm Lexical Resource. Section 5.1 cung cấp nhiều từ đồng nghĩa." }
  ],
  "missing_features": ["No overview paragraph", "No comparison between highest and lowest values"],
  "suggestions": ["Add an overview after the introduction (Section 3.1)", "Use comparison structures from Section 8"],
  "improved_sentences": [
    { "original": "The number of users increase from 2000 to 2020", "improved": "The number of users increased from 2000 to 2020", "rule": "Section 13", "explanation_vi": "Động từ phải ở thì quá khứ vì dữ liệu đã qua." }
  ]
}`;

export default function App() {
  const [keyMode, setKeyMode] = useState(
    () => localStorage.getItem("key_mode") || "system",
  );
  const [personalKey, setPersonalKey] = useState(
    () => localStorage.getItem("personal_key") || "",
  );
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [currentPrompt, setCurrentPrompt] = useState(visiblePrompts[0]);
  const [chartData, setChartData] = useState(() =>
    structuredClone(visiblePrompts[0]),
  );
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [timerOn, setTimerOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);

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

  const activeKey =
    keyMode === "personal" && personalKey ? personalKey : SYSTEM_KEY;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  useEffect(() => {
    localStorage.setItem("key_mode", keyMode);
  }, [keyMode]);

  useEffect(() => {
    if (personalKey) localStorage.setItem("personal_key", personalKey);
  }, [personalKey]);

  const selectPrompt = (id) => {
    const next = visiblePrompts.find((p) => p.id === Number(id));
    setCurrentPrompt(next);
    setChartData(structuredClone(next));
    setAnswer("");
    setResult(null);
    setError("");
  };

  const changeKey = (mode, key) => {
    setKeyMode(mode);
    if (key) setPersonalKey(key);
    setShowKeyModal(false);
  };

  const submitForAnalysis = async () => {
    if (!activeKey) {
      setShowKeyModal(true);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `IELTS Writing Task 1 prompt:\n${getDynamicDescription(chartData)}\n${currentPrompt.task}\n\nStudent's answer:\n${answer}`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        if (keyMode === "personal") {
          setError(
            "API key của bạn không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật key khác.",
          );
          setShowKeyModal(true);
        } else {
          throw new Error(`API error ${res.status}: ${await res.text()}`);
        }
        return;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");
      setResult(JSON.parse(jsonMatch[0]));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const keyLabel =
    keyMode === "system"
      ? SYSTEM_KEY
        ? "System key"
        : "Change key"
      : personalKey
        ? "Personal key"
        : "Change key";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {showKeyModal && (
        <ApiKeyModal
          mode={keyMode}
          personalKey={personalKey}
          systemKeyConfigured={!!SYSTEM_KEY}
          onSave={changeKey}
          onClose={() => setShowKeyModal(false)}
        />
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-700">
            IELTS WriteWise
          </h1>
          <button
            onClick={() => setShowKeyModal(true)}
            className="text-sm text-gray-500 hover:text-indigo-600 underline cursor-pointer"
          >
            {keyLabel}
          </button>
        </div>
      </header>

      <main className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6 min-w-0">
            {/* Prompt */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg">Prompt</h2>
                <select
                  value={currentPrompt.id}
                  onChange={(e) => selectPrompt(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 outline-0 focus:border-indigo-500"
                >
                  {visiblePrompts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {getDynamicDescription(chartData)}
              </p>
              <p className="text-sm text-gray-500 italic mt-2">
                {currentPrompt.task}
              </p>
              <div className="mt-4">
                <ChartRenderer prompt={chartData} onUpdate={setChartData} />
              </div>
            </section>

            {/* Answer */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-lg">Your Answer</h2>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                    <input type="checkbox" checked={timerOn} onChange={toggleTimer} className="cursor-pointer" />
                    Timer
                  </label>
                  {timerOn && (
                    <span className={`text-sm font-mono font-bold tabular-nums ${timeLeft <= 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                      {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-500">
                    {wordCount} words
                  </span>
                </div>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your Task 1 answer here..."
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-0 focus:border-indigo-500 resize-y"
                disabled={loading}
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={submitForAnalysis}
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
                  onClick={() => {
                    setAnswer("");
                    setResult(null);
                    setError("");
                  }}
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
            </section>
          </div>

          <div className="lg:w-[420px] xl:w-[480px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <ResultsCard result={result} wordCount={wordCount} answer={answer} onReset={() => { setAnswer(""); setResult(null); setError(""); }} />
            </div>
          </div>
        </div>
      </main>

      <ModelSelector model={model} onChange={setModel} />
    </div>
  );
}
