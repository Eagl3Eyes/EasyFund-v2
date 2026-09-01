'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CampaignStatusChartProps {
  data: { name: string; value: number; color: string }[];
}

export function CampaignStatusChart({ data }: CampaignStatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#0c1828',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend
          wrapperStyle={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
