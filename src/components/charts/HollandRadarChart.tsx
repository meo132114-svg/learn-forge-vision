import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface HollandRadarChartProps {
  data: {
    R: number;
    I: number;
    A: number;
    S: number;
    E: number;
    C: number;
  };
  maxValue?: number;
}

const HOLLAND_LABELS: Record<string, { short: string; full: string; color: string }> = {
  R: { short: 'R', full: 'Realistic - Kỹ thuật', color: 'hsl(0, 75%, 60%)' },
  I: { short: 'I', full: 'Investigative - Nghiên cứu', color: 'hsl(220, 80%, 60%)' },
  A: { short: 'A', full: 'Artistic - Nghệ thuật', color: 'hsl(280, 75%, 65%)' },
  S: { short: 'S', full: 'Social - Xã hội', color: 'hsl(160, 70%, 50%)' },
  E: { short: 'E', full: 'Enterprising - Quản lý', color: 'hsl(35, 90%, 55%)' },
  C: { short: 'C', full: 'Conventional - Nghiệp vụ', color: 'hsl(190, 90%, 50%)' },
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

export const HollandRadarChart: React.FC<HollandRadarChartProps> = ({ 
  data, 
  maxValue = 100 
}) => {
  const chartData = Object.entries(HOLLAND_LABELS).map(([key, label]) => ({
    trait: key,
    name: label.short,
    fullName: label.full,
    value: data[key as keyof typeof data] || 0,
    color: label.color,
  }));

  return (
    <div className="chart-card">
      <h3 className="text-lg font-semibold text-center mb-4">Biểu đồ Holland Code (RIASEC)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <defs>
            <linearGradient id="hollandGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(160, 70%, 50%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(190, 90%, 50%)" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="hollandFillGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(160, 70%, 50%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(190, 90%, 50%)" stopOpacity={0.3} />
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
              fontSize: 14, 
              fontWeight: 600 
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, maxValue]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            axisLine={false}
          />
          
          <Radar
            name="Holland Code"
            dataKey="value"
            stroke="url(#hollandGradient)"
            fill="url(#hollandFillGradient)"
            strokeWidth={2.5}
            dot={{ 
              r: 5, 
              fill: 'hsl(174, 72%, 40%)', 
              stroke: 'white', 
              strokeWidth: 2 
            }}
            activeDot={{ 
              r: 7, 
              fill: 'hsl(190, 90%, 50%)', 
              stroke: 'white', 
              strokeWidth: 2 
            }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Legend with Holland colors */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        {chartData.map((item) => (
          <div 
            key={item.trait}
            className="flex flex-col items-center gap-1 p-2 bg-secondary/30 rounded-lg"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: item.color }}
            >
              {item.trait}
            </div>
            <span className="text-xs text-muted-foreground text-center">
              {item.fullName.split(' - ')[1]}
            </span>
            <span className="text-sm font-bold text-primary">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HollandRadarChart;