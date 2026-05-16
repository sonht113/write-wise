const MODELS = [
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'openai/gpt-4o', label: 'GPT-4o' },
  { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku' },
  { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
  { value: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 3B (Free)' },
]

export default function ModelSelector({ model, onChange }) {
  return (
    <div className="fixed bottom-4 right-4">
      <select value={model} onChange={(e) => onChange(e.target.value)} className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white shadow-sm outline-0">
        {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
    </div>
  )
}
