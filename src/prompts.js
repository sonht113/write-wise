const prompts = [
  {
    id: 1,
    title: 'Line Graph: Internet Users',
    chartType: 'line',
    task: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    description:
      'The line graph below shows the number of internet users per 100 inhabitants in three countries from 2000 to 2020.',
    data: [
      { year: '2000', USA: 43, Japan: 30, India: 0.5 },
      { year: '2004', USA: 65, Japan: 62, India: 2 },
      { year: '2008', USA: 74, Japan: 75, India: 4 },
      { year: '2012', USA: 81, Japan: 79, India: 12 },
      { year: '2016', USA: 87, Japan: 84, India: 30 },
      { year: '2020', USA: 91, Japan: 90, India: 50 },
    ],
    lines: [
      { dataKey: 'USA', color: '#4f46e5' },
      { dataKey: 'Japan', color: '#dc2626' },
      { dataKey: 'India', color: '#16a34a' },
    ],
    xAxisKey: 'year',
    yAxisLabel: 'Users per 100 inhabitants',
  },
  {
    id: 2,
    title: 'Bar Chart: Energy Sources',
    chartType: 'bar',
    task: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    description:
      'The bar chart below shows the percentage of energy generated from different sources in a European country in 2005 and 2025.',
    data: [
      { source: 'Coal', '2005': 45, '2025': 20 },
      { source: 'Natural Gas', '2005': 30, '2025': 25 },
      { source: 'Nuclear', '2005': 18, '2025': 22 },
      { source: 'Renewable', '2005': 7, '2025': 33 },
    ],
    bars: [
      { dataKey: '2005', color: '#f97316', name: '2005' },
      { dataKey: '2025', color: '#22c55e', name: '2025' },
    ],
    xAxisKey: 'source',
    yAxisLabel: 'Percentage (%)',
  },
  {
    id: 3,
    title: 'Pie Charts: Household Spending',
    chartType: 'pie',
    task: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    description:
      'The pie charts below show the average household spending in four categories in two different years: 2010 and 2020.',
    pieData: [
      {
        year: '2010',
        data: [
          { name: 'Housing', value: 35, color: '#4f46e5' },
          { name: 'Food', value: 28, color: '#f97316' },
          { name: 'Transport', value: 22, color: '#22c55e' },
          { name: 'Entertainment', value: 15, color: '#eab308' },
        ],
      },
      {
        year: '2020',
        data: [
          { name: 'Housing', value: 38, color: '#4f46e5' },
          { name: 'Food', value: 20, color: '#f97316' },
          { name: 'Transport', value: 18, color: '#22c55e' },
          { name: 'Entertainment', value: 24, color: '#eab308' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Table: International Student Enrolment',
    chartType: 'table',
    task: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    description:
      'The table below shows the number of international students (in thousands) enrolled in universities in four English-speaking countries from 2015 to 2023.',
    tableData: [
      { country: 'United Kingdom', '2015': 428, '2017': 442, '2019': 485, '2021': 520, '2023': 558 },
      { country: 'United States', '2015': 907, '2017': 890, '2019': 860, '2021': 835, '2023': 810 },
      { country: 'Canada', '2015': 235, '2017': 285, '2019': 345, '2021': 420, '2023': 480 },
      { country: 'Australia', '2015': 310, '2017': 365, '2019': 420, '2021': 390, '2023': 450 },
    ],
  },
  {
    id: 5,
    title: 'Process Diagram: Water Cycle',
    chartType: 'process',
    task: 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    description:
      'The diagram below shows the water cycle, which is the continuous movement of water within the Earth and its atmosphere.',
    stages: [
      { id: 1, label: 'Evaporation', desc: 'Sun heats water in oceans, rivers, and lakes, turning it into water vapour that rises into the air.', x: 20, y: 55 },
      { id: 2, label: 'Condensation', desc: 'Water vapour rises, cools down, and forms clouds.', x: 50, y: 15 },
      { id: 3, label: 'Precipitation', desc: 'Water falls back to Earth as rain, snow, or hail.', x: 80, y: 55 },
      { id: 4, label: 'Collection', desc: 'Water collects in oceans, rivers, and lakes, and the cycle begins again.', x: 50, y: 85 },
    ],
  },
]

export default prompts
