import { useState } from "react";
import prompts from "./prompts";
import ApiKeyModal from "./components/ApiKeyModal";
import ModelSelector from "./components/ModelSelector";
import HintDrawer from "./components/HintDrawer";
import ProgressDashboard from "./components/ProgressDashboard";
import SampleEssaysModal from "./components/SampleEssaysModal";
import PracticeView from "./components/PracticeView";
import useHistory from "./hooks/useHistory";
import useApiKey from "./hooks/useApiKey";
import useAnalysis from "./hooks/useAnalysis";
import useAutoSave from "./hooks/useAutoSave";

const visiblePrompts = prompts.filter((p) => p.chartType !== "process");

export default function App() {
  const [currentView, setCurrentView] = useState("practice");
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(visiblePrompts[0]);
  const [chartData, setChartData] = useState(() =>
    structuredClone(visiblePrompts[0]),
  );
  const [answer, setAnswer] = useState("");
  const [model, setModel] = useState("openai/gpt-4o-mini");

  // Hooks
  const apiKey = useApiKey();
  const autoSave = useAutoSave(currentPrompt.id, answer);
  const {
    submissions,
    stats,
    saveSubmission,
    deleteSubmission,
    clearHistory,
    exportHistory,
    importHistory,
  } = useHistory();

  const analysis = useAnalysis({
    activeKey: apiKey.activeKey,
    model,
    chartData,
    currentPrompt,
    answer,
    wordCount: answer.trim() ? answer.trim().split(/\s+/).length : 0,
    onNoKey: () => apiKey.setShowKeyModal(true),
    onInvalidKey:
      apiKey.keyMode === "personal"
        ? () => {
            analysis.reset();
            apiKey.setShowKeyModal(true);
          }
        : undefined,
    saveSubmission,
  });

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  // Draft recovery — use lazy init to avoid setState in effect
  const [draftBanner, setDraftBanner] = useState(() => {
    const raw = localStorage.getItem("ielts-current-draft");
    if (!raw) return null;
    try {
      const draft = JSON.parse(raw);
      if (draft && draft.answer && draft.answer.trim()) return draft;
    } catch {
      /* ignore */
    }
    return null;
  });

  const resumeDraft = () => {
    if (draftBanner) {
      const matchingPrompt = visiblePrompts.find(
        (p) => p.id === draftBanner.promptId,
      );
      if (matchingPrompt) {
        setCurrentPrompt(matchingPrompt);
        setChartData(structuredClone(matchingPrompt));
      }
      setAnswer(draftBanner.answer);
      setDraftBanner(null);
    }
  };

  const discardDraft = () => {
    autoSave.clearDraft();
    setDraftBanner(null);
  };

  const selectPrompt = (id) => {
    const next = visiblePrompts.find((p) => p.id === Number(id));
    setCurrentPrompt(next);
    setChartData(structuredClone(next));
    setAnswer("");
    analysis.reset();
  };

  const handleReset = () => {
    setAnswer("");
    analysis.reset();
    autoSave.clearDraft();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {apiKey.showKeyModal && (
        <ApiKeyModal
          mode={apiKey.keyMode}
          personalKey={apiKey.personalKey}
          systemKeyConfigured={apiKey.systemKeyConfigured}
          onSave={apiKey.changeKey}
          onClose={() => apiKey.setShowKeyModal(false)}
        />
      )}

      <SampleEssaysModal
        isOpen={showSamplesModal}
        onClose={() => setShowSamplesModal(false)}
        initialChartType={currentPrompt.chartType}
      />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-700">IELTS WriteWise</h1>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentView("practice")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentView === "practice" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Practice
            </button>
            <button
              onClick={() => setCurrentView("progress")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentView === "progress" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Progress
            </button>
          </nav>
          <button
            onClick={() => apiKey.setShowKeyModal(true)}
            className="text-sm text-gray-500 hover:text-indigo-600 underline cursor-pointer"
          >
            {apiKey.keyLabel}
          </button>
        </div>
      </header>

      <main className="max-w-4xl lg:max-w-6xl mx-auto px-4 py-6">
        {currentView === "progress" ? (
          <ProgressDashboard
            submissions={submissions}
            stats={stats}
            onDeleteSubmission={deleteSubmission}
            onExport={exportHistory}
            onImport={importHistory}
            onClearAll={clearHistory}
          />
        ) : (
          <PracticeView
            visiblePrompts={visiblePrompts}
            currentPrompt={currentPrompt}
            chartData={chartData}
            onSelectPrompt={selectPrompt}
            onUpdateChart={setChartData}
            onShowSamples={() => setShowSamplesModal(true)}
            answer={answer}
            onAnswerChange={setAnswer}
            loading={analysis.loading}
            result={analysis.result}
            error={analysis.error}
            wordCount={wordCount}
            onSubmit={analysis.submit}
            onReset={handleReset}
            autoSaveStatus={autoSave.status}
            autoSaveLastSaved={autoSave.lastSaved}
            draftBanner={draftBanner}
            onResumeDraft={resumeDraft}
            onDiscardDraft={discardDraft}
          />
        )}
      </main>

      <ModelSelector model={model} onChange={setModel} />
      <HintDrawer chartType={currentPrompt?.chartType} />
    </div>
  );
}
