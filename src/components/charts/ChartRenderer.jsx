import LineChartView from './LineChartView'
import BarChartView from './BarChartView'
import PieChartView from './PieChartView'
import TableView from './TableView'
import ProcessDiagramView from './ProcessDiagramView'

const VIEWS = {
  line: LineChartView,
  bar: BarChartView,
  pie: PieChartView,
  table: TableView,
  process: ProcessDiagramView,
}

export default function ChartRenderer({ prompt, onUpdate }) {
  const View = VIEWS[prompt?.chartType]
  if (!View) return null
  return <View prompt={prompt} onUpdate={onUpdate} />
}
