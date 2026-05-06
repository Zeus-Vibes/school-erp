import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const ResultsRadar = ({ subjects }) => {
  const chartData = subjects.map((subject) => ({
    subject: subject.name,
    marks: subject.obtained,
    fullMark: subject.maxMarks,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: '#6B7280' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#6B7280' }}
        />
        <Radar
          name="Marks"
          dataKey="marks"
          stroke="#1E3A5F"
          fill="#1E3A5F"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
          }}
          formatter={(value) => [`${value} / 100`, 'Marks']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default ResultsRadar
