import { useMemo, memo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { COLORS } from '../../utils/chartTransforms';

const CATEGORY_SHORT = {
  'Keyword Optimization': 'Keywords',
  'Content Structure': 'Structure',
  'Readability': 'Readability',
  'Keyword Prominence': 'Prominence',
  'Semantic Coverage': 'Semantic',
  'Keyword Distribution': 'Distribution',
};

/**
 * Radar chart comparing primary vs competitor average scores per category.
 */
function CompetitorRadar({ primary, competitors }) {
  const data = useMemo(() => {
    if (!primary?.category_scores?.length) return [];

    const validComps = competitors.filter((c) => !c.error && c.category_scores?.length);

    return primary.category_scores.map((cat) => {
      const compScores = validComps.map(
        (c) => c.category_scores.find((cc) => cc.name === cat.name)?.score ?? 0
      );
      const compAvg = compScores.length > 0
        ? compScores.reduce((s, v) => s + v, 0) / compScores.length
        : 0;

      return {
        category: CATEGORY_SHORT[cat.name] || cat.name,
        You: Math.round(cat.score),
        Competitors: Math.round(compAvg),
      };
    });
  }, [primary, competitors]);

  if (data.length === 0) return null;

  return (
    <div className="cp-radar-wrap">
      <div className="cp-radar-title">Score Comparison</div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke={COLORS.grid} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: COLORS.axis }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="You" dataKey="You" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.2} strokeWidth={2} />
          <Radar name="Competitors" dataKey="Competitors" stroke={COLORS.periwinkle} fill={COLORS.periwinkle} fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              background: COLORS.tooltipBg, color: COLORS.tooltipText, borderRadius: 10,
              border: `1px solid ${COLORS.grid}`,
              fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(CompetitorRadar);
