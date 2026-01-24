import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface BigFiveRadarChartProps {
  data: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  maxValue?: number;
}

const TRAIT_LABELS: Record<string, string> = {
  O: 'Cởi mở',
  C: 'Tận tâm',
  E: 'Hướng ngoại',
  A: 'Dễ chịu',
  N: 'Nhạy cảm',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border/50 rounded-lg shadow-xl p-3 backdrop-blur-xl">
        <p className="font-semibold text-foreground">{data.fullName}</p>
        <p className="text-primary font-bold text-lg">{data.value}%</p>
      </div>
    );
  }
  return null;
};

export const BigFiveRadarChart: React.FC<BigFiveRadarChartProps> = ({ 
  data, 
  maxValue = 100 
}) => {
  const chartData = [
    { trait: 'O', name: TRAIT_LABELS.O, fullName: 'Openness - Cởi mở', value: data.O },
    { trait: 'C', name: TRAIT_LABELS.C, fullName: 'Conscientiousness - Tận tâm', value: data.C },
    { trait: 'E', name: TRAIT_LABELS.E, fullName: 'Extraversion - Hướng ngoại', value: data.E },
    { trait: 'A', name: TRAIT_LABELS.A, fullName: 'Agreeableness - Dễ chịu', value: data.A },
    { trait: 'N', name: TRAIT_LABELS.N, fullName: 'Neuroticism - Nhạy cảm', value: data.N },
  ];

  return (
    <div className="chart-card">
      <h3 className="text-lg font-semibold text-center mb-4">Biểu đồ Big Five (OCEAN)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <defs>
            <linearGradient id="bigFiveGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(280, 60%, 65%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(220, 70%, 60%)" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="bigFiveFillGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(280, 60%, 65%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(220, 70%, 60%)" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          
          <PolarGrid 
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ 
              fill: 'hsl(var(--foreground))', 
              fontSize: 13, 
              fontWeight: 500 
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, maxValue]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={false}
          />
          
          <Radar
            name="Big Five"
            dataKey="value"
            stroke="url(#bigFiveGradient)"
            fill="url(#bigFiveFillGradient)"
            strokeWidth={2.5}
            dot={{ 
              r: 5, 
              fill: 'hsl(280, 60%, 65%)', 
              stroke: 'white', 
              strokeWidth: 2 
            }}
            activeDot={{ 
              r: 7, 
              fill: 'hsl(220, 70%, 60%)', 
              stroke: 'white', 
              strokeWidth: 2 
            }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.map((item) => (
          <div 
            key={item.trait}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-sm"
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                background: `linear-gradient(135deg, hsl(280, 60%, 65%) 0%, hsl(220, 70%, 60%) 100%)`
              }}
            />
            <span className="font-medium">{item.name}</span>
            <span className="text-primary font-bold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BigFiveRadarChart;