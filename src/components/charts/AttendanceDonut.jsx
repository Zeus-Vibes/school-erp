import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = {
  present: '#6B8E23',
  absent: '#B23A3A',
  late: '#D4A017',
}

const AttendanceDonut = ({ present = 0, absent = 0, late = 0, centerLabel }) => {
  const total = present + absent + late
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0

  const chartData = [
    { name: 'Present', value: present, color: COLORS.present },
    { name: 'Absent', value: absent, color: COLORS.absent },
    { name: 'Late', value: late, color: COLORS.late },
  ].filter((entry) => entry.value > 0)

  const renderCustomLabel = ({ cx, cy }) => (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-8" className="text-2xl font-extrabold fill-textPrimary">
        {centerLabel || `${percentage}%`}
      </tspan>
      <tspan x={cx} dy="22" className="text-xs fill-textMuted">
        Attendance
      </tspan>
    </text>
  )

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} days`, name]}
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 12px rgba(30,58,95,0.08)',
            }}
          />
          {renderCustomLabel({ cx: '50%', cy: '50%' })}
        </PieChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-2">
        {[
          { label: 'Present', value: present, color: COLORS.present },
          { label: 'Absent', value: absent, color: COLORS.absent },
          { label: 'Late', value: late, color: COLORS.late },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-textMuted">
              {item.label}: <span className="font-medium text-textPrimary">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AttendanceDonut
