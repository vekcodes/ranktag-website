import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { toDensityZones } from '../../utils/chartTransforms';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="ch-tooltip">
      <div className="ch-tooltip-row">
        <span style={{ color: d.color }}>{d.name}</span>
        <strong>{d.value} keyword{d.value !== 1 ? 's' : ''}</strong>
      </div>
    </div>
  );
};

export default function DensityDonut({ keywords, gram = '1gram' }) {
  const zones = useMemo(() => toDensityZones(keywords, gram), [keywords, gram]);

  if (zones.length === 0) return null;

  const total = zones.reduce((s, z) => s + z.value, 0);

  return (
    <div className="ch-card ch-card-compact">
      <div className="ch-card-head">
        <div className="ch-card-title">Density Zones</div>
      </div>
      <div className="ch-donut-wrap">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={zones}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={76}
              paddingAngle={3}
              dataKey="value"
              animationDuration={600}
              stroke="none"
            >
              {zones.map((z, i) => (
                <Cell key={i} fill={z.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="ch-donut-center">
          <div className="ch-donut-total">{total}</div>
          <div className="ch-donut-label">keywords</div>
        </div>
      </div>
      <div className="ch-donut-legend">
        {zones.map((z) => (
          <div key={z.name} className="ch-donut-legend-item">
            <span className="ch-donut-legend-dot" style={{ background: z.color }} />
            <span className="ch-donut-legend-name">{z.name}</span>
            <span className="ch-donut-legend-val">{z.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
