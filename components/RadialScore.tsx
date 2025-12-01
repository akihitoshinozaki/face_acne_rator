import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadialScoreProps {
  score: number; // 0 (Good) - 100 (Severe)
}

export const RadialScore: React.FC<RadialScoreProps> = ({ score }) => {
  // Invert score for display context if we want 100% to be "full bar" for severity
  const data = [{ name: 'Severity', value: score, fill: '#ef4444' }];
  
  // Determine color based on severity
  let color = '#22c55e'; // Green
  let label = 'Clear';
  if (score > 20) { color = '#eab308'; label = 'Mild'; } // Yellow
  if (score > 50) { color = '#f97316'; label = 'Moderate'; } // Orange
  if (score > 75) { color = '#ef4444'; label = 'Severe'; } // Red

  data[0].fill = color;

  return (
    <div className="relative w-full h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={10} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            clockWise
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Severity</span>
        <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
      </div>
    </div>
  );
};