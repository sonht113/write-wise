/**
 * Generate a dynamic text description from chart data.
 * Used both in the UI prompt display and when sending context to the AI.
 */
export default function getDynamicDescription(data) {
  switch (data?.chartType) {
    case "line": {
      const n = data.lines?.length ?? 0;
      const labels =
        data.data?.map((r) => r[data.xAxisKey]).filter(Boolean) ?? [];
      return `The line graph shows ${data.yAxisLabel ?? "data"} for ${n} data series from ${labels[0] ?? "?"} to ${labels[labels.length - 1] ?? "?"}.`;
    }
    case "bar": {
      const n = data.data?.length ?? 0;
      const groups = data.bars?.length ?? 0;
      return `The bar chart shows ${data.yAxisLabel ?? "percentages"} for ${n} categories across ${groups} time periods.`;
    }
    case "pie": {
      const years = data.pieData?.length ?? 0;
      const segments = data.pieData?.[0]?.data?.length ?? 0;
      return `The pie charts show ${segments} categories of spending in ${years} different years.`;
    }
    case "table": {
      const countries = data.tableData?.length ?? 0;
      const years = Object.keys(data.tableData?.[0] ?? {}).filter(
        (k) => k !== "country",
      );
      return `The table shows data for ${countries} countries from ${years[0] ?? "?"} to ${years[years.length - 1] ?? "?"}.`;
    }
    default:
      return data?.description ?? "";
  }
}
