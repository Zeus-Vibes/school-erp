import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '../../utils/helpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-card">
      <p className="text-sm font-semibold text-textPrimary mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

const FeeBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data} barGap={4} barCategoryGap="25%">
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis
        dataKey="class"
        tick={{ fontSize: 12, fill: '#6B7280' }}
        axisLine={{ stroke: '#E5E7EB' }}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 12, fill: '#6B7280' }}
        axisLine={{ stroke: '#E5E7EB' }}
        tickLine={false}
        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend
        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
      />
      <Bar dataKey="collected" name="Collected" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
      <Bar dataKey="pending" name="Pending" fill="#B23A3A" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
)

export default FeeBarChart
