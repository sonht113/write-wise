import { useState } from 'react'

export default function ApiKeyModal({ mode, personalKey, systemKeyConfigured, onSave, onClose }) {
  const [tempMode, setTempMode] = useState(mode)
  const [tempKey, setTempKey] = useState(personalKey)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-4">API Key Settings</h2>

        <label className="flex items-start gap-3 p-3 rounded-lg border mb-2 cursor-pointer hover:bg-gray-50">
          <input type="radio" name="keyMode" checked={tempMode === 'system'} onChange={() => setTempMode('system')} className="mt-0.5" />
          <div>
            <div className="text-sm font-medium">Use system key</div>
            <div className="text-xs text-gray-500">{systemKeyConfigured ? 'System key is configured' : 'No system key found (.env not set)'}</div>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-lg border mb-4 cursor-pointer hover:bg-gray-50">
          <input type="radio" name="keyMode" checked={tempMode === 'personal'} onChange={() => setTempMode('personal')} className="mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium">Use my own key</div>
            {tempMode === 'personal' && (
              <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="sk-or-v1-..." className="w-full border border-gray-300 rounded-lg px-3 py-1.5 mt-2 text-sm outline-0 focus:border-indigo-500" autoFocus />
            )}
          </div>
        </label>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Cancel</button>
          <button onClick={() => onSave(tempMode, tempKey)} disabled={tempMode === 'personal' && !tempKey.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Save</button>
        </div>
      </div>
    </div>
  )
}
