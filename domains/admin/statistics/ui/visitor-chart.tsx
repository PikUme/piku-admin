"use client";

import { useState } from "react";
import { type ChartDataPoint, type TabKind } from "../model/statistics-data";

interface VisitorChartProps {
  chartData: ChartDataPoint[];
  tabKind: TabKind;
}

export function VisitorChart({ chartData, tabKind }: VisitorChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Find max total to calculate dynamic scaling
  const maxTotal = Math.max(...chartData.map((d) => d.primary + d.secondary), 10);
  
  // Determine a nice round number for the Y-axis maximum scale
  let maxScale = 3000;
  if (maxTotal > 200000) maxScale = 750000;
  else if (maxTotal > 50000) maxScale = 80000;
  else if (maxTotal > 20000) maxScale = 25000;
  else if (maxTotal > 10000) maxScale = 15000;
  else if (maxTotal > 5000) maxScale = 7000;
  else if (maxTotal > 2000) maxScale = 4000;
  else if (maxTotal > 1000) maxScale = 1500;
  else if (maxTotal > 500) maxScale = 800;
  else if (maxTotal > 200) maxScale = 350;
  else maxScale = Math.ceil(maxTotal * 1.2 / 50) * 50;

  const ticks = [
    0,
    Math.floor(maxScale * 0.25),
    Math.floor(maxScale * 0.5),
    Math.floor(maxScale * 0.75),
    maxScale,
  ];

  // Helper for formatting Y-axis labels
  const formatTick = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const N = chartData.length;
  const chartWidth = 712;
  const space = chartWidth / N;
  const barWidth = N <= 7 ? 32 : N <= 15 ? 20 : 12;

  // Colors based on TabKind
  const getLegendLabels = (): [string, string] => {
    switch (tabKind) {
      case "visitor":
        return ["신규 방문", "재방문"];
      case "member":
        return ["이메일 가입", "소셜 가입"];
      case "diary":
        return ["텍스트 일기", "사진 첨부"];
      case "photo":
        return ["성공 건수", "실패 건수"];
    }
  };

  const getColors = (): [string, string] => {
    switch (tabKind) {
      case "visitor":
        return ["#0864d9", "#b4c9e4"]; // Dark Blue, Light Blue/Gray
      case "member":
        return ["#2563eb", "#93c5fd"]; // Blue, Sky Blue
      case "diary":
        return ["#0d9488", "#99f6e4"]; // Teal, Light Teal
      case "photo":
        return ["#4f46e5", "#c7d2fe"]; // Indigo, Light Indigo
    }
  };

  const [primaryColor, secondaryColor] = getColors();
  const [primaryLabel, secondaryLabel] = getLegendLabels();

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex justify-end gap-4 text-xs font-medium text-slate-500 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          {primaryLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
          {secondaryLabel}
        </span>
      </div>

      <svg
        className="w-full h-[300px] overflow-visible"
        viewBox="0 0 760 300"
        role="img"
        aria-label="통계 지표 막대 차트"
      >
        {/* Y Axis Grid Lines & Ticks */}
        {ticks.map((tick) => {
          const y = 250 - (tick / maxScale) * 220;
          return (
            <g key={tick}>
              <line x1="48" x2="740" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={tick === 0 ? "0" : "4 4"} />
              <text x="36" y={y + 4} textAnchor="end" fontSize="11" className="fill-slate-400 font-medium">
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        {/* X Axis Line */}
        <line x1="48" x2="740" y1="250" y2="250" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Bars */}
        {chartData.map((item, index) => {
          const x = 48 + index * space + space / 2 - barWidth / 2;
          const primaryHeight = (item.primary / maxScale) * 220;
          const secondaryHeight = (item.secondary / maxScale) * 220;
          const totalHeight = primaryHeight + secondaryHeight;

          const isHovered = hoveredIndex === index;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch/hover area */}
              <rect
                x={48 + index * space}
                y="30"
                width={space}
                height="220"
                fill="transparent"
              />

              {/* Combined Top Bar (Re-visit or Secondary data) */}
              <rect
                x={x}
                y={250 - totalHeight}
                width={barWidth}
                height={Math.max(totalHeight, 1)}
                rx="4"
                fill={secondaryColor}
                className="transition-all duration-200"
                style={{ opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1 }}
              />

              {/* Bottom Bar (New visit or Primary data) - draws flat rect to overlay base and leave rounded top */}
              {primaryHeight > 0 && (
                <rect
                  x={x}
                  y={250 - primaryHeight}
                  width={barWidth}
                  height={primaryHeight}
                  fill={primaryColor}
                  className="transition-all duration-200"
                  style={{ opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1 }}
                />
              )}

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y="272"
                textAnchor="middle"
                fontSize="11"
                className={`transition-colors duration-200 ${
                  isHovered ? "fill-slate-900 font-bold" : "fill-slate-400 font-medium"
                }`}
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {/* Tooltip Overlay */}
        {hoveredIndex !== null && (
          (() => {
            const item = chartData[hoveredIndex];
            const x = 48 + hoveredIndex * space + space / 2;
            const y = 250 - ((item.primary + item.secondary) / maxScale) * 220 - 15;
            
            // Adjust tooltip position to stay within bounds
            const tooltipX = x > 600 ? x - 130 : x < 100 ? x : x - 65;
            const tooltipY = y < 50 ? y + 60 : y;

            return (
              <g className="pointer-events-none drop-shadow-md">
                <rect
                  x={tooltipX}
                  y={tooltipY - 50}
                  width="130"
                  height="56"
                  rx="6"
                  fill="#1e293b"
                />
                <text x={tooltipX + 10} y={tooltipY - 34} fontSize="11" className="fill-white font-bold">
                  {item.label}
                </text>
                <text x={tooltipX + 10} y={tooltipY - 18} fontSize="10" className="fill-slate-300">
                  {primaryLabel}: {item.primary.toLocaleString()}
                </text>
                <text x={tooltipX + 10} y={tooltipY - 6} fontSize="10" className="fill-slate-300">
                  {secondaryLabel}: {item.secondary.toLocaleString()}
                </text>
              </g>
            );
          })()
        )}
      </svg>
    </div>
  );
}
