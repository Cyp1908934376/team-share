import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { cn } from '@/utils/cn'

interface TimeSeriesData {
  timestamp: string
  [key: string]: any
}

interface SeriesConfig {
  key: string
  name: string
  color: string
  type?: 'line' | 'area'
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  series: SeriesConfig[]
  title?: string
  height?: number
  className?: string
  loading?: boolean
}

export function TimeSeriesChart({
  data,
  series,
  title,
  height = 300,
  className,
  loading,
}: TimeSeriesChartProps) {
  if (loading) {
    return (
      <div
        className={cn('bg-bg-primary rounded-xl p-4 border border-separator', className)}
        style={{ height }}
      >
        <div className="animate-pulse h-full bg-fill-quaternary rounded-lg" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn('bg-bg-primary rounded-xl p-4 border border-separator flex items-center justify-center', className)}
        style={{ height }}
      >
        <p className="text-label-tertiary text-callout">暂无数据</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-bg-primary rounded-xl p-4 border border-separator', className)}>
      {title && (
        <h3 className="text-headline text-label-primary mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 48 : 0)}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--separator)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--separator)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-2)',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}
          />
          <Legend
            iconType="line"
            formatter={(value: string) => (
              <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{value}</span>
            )}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              fill={`url(#gradient-${s.key})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-primary)' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
