import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';

export default function DisplayPreferences() {
  const { preferences, toggleWeightPercentage, toggleVoterPercentage } = useDisplayPreferences();

  return (
    <div className="bg-[#2c3e50] rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-3">Görünüm Tercihleri</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={preferences.showWeightPercentage}
            onChange={toggleWeightPercentage}
            className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
          <span className="select-none">
            Ağırlık yüzdesini göster <span className="text-gray-400">(% Σ)</span>
          </span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={preferences.showVoterPercentage}
            onChange={toggleVoterPercentage}
            className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
          <span className="select-none">
            Liste yüzdesini göster <span className="text-gray-400">(% 👤)</span>
          </span>
        </label>
      </div>
    </div>
  );
}

