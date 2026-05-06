import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MonthlyTrendLine = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis
        dataKey="month"
        tick={{ fontSize: 12, fill: '#6B7280' }}
        axisLine={{ stroke: '#E5E7EB' }}
        tickLine={false}
      />
      <YAxis
        domain={[0, 100]}
        tick={{ fontSize: 12, fill: '#6B7280' }}
        axisLine={{ stroke: '#E5E7EB' }}
        tickLine={false}
        tickFormatter={(value) => `${value}%`}
      />
      <Tooltip
        contentStyle={{
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
        }}
        formatter={(value) => [`${value}%`, 'Attendance']}
      />
      <Line
        type="monotone"
        dataKey="attendance"
        stroke="#1E3A5F"
        strokeWidth={2.5}
        dot={{ r: 4, fill: '#1E3A5F', strokeWidth: 2, stroke: '#fff' }}
        activeDot={{ r: 6, fill: '#D4A017', strokeWidth: 2, stroke: '#fff' }}
      />
    </LineChart>
  </ResponsiveContainer>
)

export default MonthlyTrendLine
