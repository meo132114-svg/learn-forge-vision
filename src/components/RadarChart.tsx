import React, { useEffect, useRef } from 'react';

interface RadarChartProps {
  data: { label: string; value: number; maxValue: number }[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const numPoints = data.length;
    const angleStep = (Math.PI * 2) / numPoints;
    const startAngle = -Math.PI / 2; // Start from top

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw grid circles
    const gridLevels = 5;
    for (let i = 1; i <= gridLevels; i++) {
      const r = (radius * i) / gridLevels;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw grid lines
    for (let i = 0; i < numPoints; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Holland colors (matching CSS variables)
    const hollandColors: Record<string, string> = {
      'R': 'rgb(239, 68, 68)',   // Red
      'I': 'rgb(59, 130, 246)',  // Blue
      'A': 'rgb(168, 85, 247)',  // Purple
      'S': 'rgb(34, 197, 94)',   // Green
      'E': 'rgb(249, 115, 22)',  // Orange
      'C': 'rgb(0, 212, 255)',   // Cyan
    };

    // Calculate data points
    const points = data.map((item, i) => {
      const angle = startAngle + i * angleStep;
      const value = item.value / item.maxValue;
      const r = radius * value;
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        label: item.label,
        value: item.value,
        maxValue: item.maxValue,
        angle,
        color: hollandColors[item.label] || 'rgb(0, 212, 255)'
      };
    });

    // Draw data area with gradient
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();

    // Create gradient fill
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw data area stroke
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points and labels
    points.forEach((point) => {
      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelRadius = radius + 35;
      const labelX = centerX + Math.cos(point.angle) * labelRadius;
      const labelY = centerY + Math.sin(point.angle) * labelRadius;

      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.fillStyle = point.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.label, labelX, labelY);

      // Draw percentage
      const pctRadius = radius + 55;
      const pctX = centerX + Math.cos(point.angle) * pctRadius;
      const pctY = centerY + Math.sin(point.angle) * pctRadius;
      const pct = Math.round((point.value / point.maxValue) * 100);

      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`${pct}%`, pctX, pctY);
    });

  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto"
      style={{ width: size, height: size }}
    />
  );
};

export default RadarChart;