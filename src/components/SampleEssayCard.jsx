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

export default function SampleEssayCard({ essay, onClick }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded border ${getBandColor(essay.bandScore)}`}
        >
          {essay.bandScore.toFixed(1)}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {getChartTypeLabel(essay.chartType)}
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
        {essay.title}
      </h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
        {essay.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{essay.wordCount} words</span>
        <button
          onClick={() => onClick(essay)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
        >
          View Full Essay →
        </button>
      </div>
    </div>
  );
}
