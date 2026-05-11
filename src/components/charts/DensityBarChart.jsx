import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { toBarChartData, COLORS } from '../../utils/chartTransforms';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="ch-tooltip">
      <div className="ch-tooltip-kw">{d.keyword}</div>
      <div className="ch-tooltip-row">
        <span>Frequency</span><strong>{d.count}</strong>
      </div>
      <div className="ch-tooltip-row">
        <span>Density</span><strong style={{ color: d.fill }}>{d.density}%</strong>
      </div>
      <div className="ch-tooltip-zone" style={{ color: d.fill }}>{d.zone}</div>
    </div>
  );
};

export default function DensityBarChart({ keywords, gram = '1gram' }) {
  const data = useMemo(() => toBarChartData(keywords, gram, 12), [keywords, gram]);

  if (data.length === 0) return null;

  return (
    <div className="ch-card">
      <div className="ch-card-head">
        <div className="ch-card-title">Keyword Density</div>
        <div className="ch-card-sub">Top keywords by density percentage</div>
      </div>
      <div className="ch-bar-container">
        <ResponsiveContainer width="100%" height={Math.max(240, data.length * 36)}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 4 }}>
            <CartesianGrid
              horizontal={false}
              stroke={COLORS.paper3}
              strokeDasharray="3 3"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: COLORS.muted }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="keyword"
              width={100}
              tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fill: COLORS.ink }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="density" radius={[0, 4, 4, 0]} maxBarSize={24} animationDuration={600}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
