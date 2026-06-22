"use client";

import { useState } from "react";
import type { DailyActiveUserPoint, WeeklyActivityPoint } from "../api/contracts";

const formatDateLabel = (dateStr: string) => {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${month}/${day}`;
  }
  return dateStr;
};

const formatWeekLabel = (dateStr: string) => {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}.${parts[2]}`;
  }
  return dateStr;
};

export function DailyActiveBarChart({ data = [] }: { data?: DailyActiveUserPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.dau), 10);
  const max = Math.max(Math.ceil(maxVal / 5000) * 5000, 5000);
  const ticks = [0, Math.round(max / 3), Math.round((max * 2) / 3), max];

  return (
    <svg
      className="mt-5 h-[290px] w-full overflow-visible"
      viewBox="0 0 720 300"
      role="img"
      aria-label="최근 7일 일간 활성 사용자 막대 차트"
    >
      {ticks.map((tick) => {
        const y = 250 - (tick / max) * 220;
        return (
          <g key={tick}>
            <line x1="48" x2="700" y1={y} y2={y} stroke="#e7eaf0" strokeWidth="1" />
            <text x="38" y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {tick === 0 ? "0" : tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick.toString()}
            </text>
          </g>
        );
      })}
      <line x1="48" x2="700" y1="250" y2="250" stroke="#cbd5e1" />
      {data.map((item, index) => {
        const x = 76 + index * 88;
        const height = (item.dau / max) * 220;
        const isHovered = hoveredIndex === index;
        return (
          <g
            key={item.date}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            {/* Invisible touch/hover area */}
            <rect
              x={x - 33}
              y="30"
              width="88"
              height="220"
              fill="#000"
              opacity="0"
            />
            <rect
              x={x}
              y={250 - height}
              width="22"
              height={height}
              rx="4"
              fill="#0864d9"
              className="transition-all duration-200"
              style={{ opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1 }}
            />
            <text
              x={x + 11}
              y="274"
              textAnchor="middle"
              fontSize="12"
              className={`transition-colors duration-200 ${isHovered ? "fill-slate-950 font-bold" : "fill-slate-500 font-medium"
                }`}
            >
              {formatDateLabel(item.date)}
            </text>
          </g>
        );
      })}
      {/* Tooltip Overlay */}
      {hoveredIndex !== null && (
        (() => {
          const item = data[hoveredIndex];
          const x = 76 + hoveredIndex * 88 + 11;
          const y = 250 - (item.dau / max) * 220 - 15;
          const tooltipX = x > 530 ? x - 160 : x - 80;
          const tooltipY = y < 50 ? y + 60 : y;
          return (
            <g className="pointer-events-none drop-shadow-md">
              <rect x={tooltipX} y={tooltipY - 44} width="160" height="50" rx="8" fill="#1e293b" />
              <text x={tooltipX + 12} y={tooltipY - 28} fontSize="13" className="fill-white font-bold">
                {item.date}
              </text>
              <text x={tooltipX + 12} y={tooltipY - 11} fontSize="11" className="fill-slate-300">
                활성 사용자: {item.dau.toLocaleString()}명
              </text>
            </g>
          );
        })()
      )}
    </svg>
  );
}

export function WeeklyComparisonChart({ data = [] }: { data?: WeeklyActivityPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.newMemberCount, d.diaryCreationCount)),
    10,
  );
  const max = Math.max(Math.ceil(maxVal / 100) * 100, 100);

  return (
    <div>
      <svg
        className="mt-5 h-[245px] w-full overflow-visible"
        viewBox="0 0 520 250"
        role="img"
        aria-label="주간 신규 가입 및 일기 작성 비교 막대 차트"
      >
        <line x1="40" x2="500" y1="210" y2="210" stroke="#cbd5e1" />
        {data.map((item, index) => {
          const x = 78 + index * 105;
          const usersHeight = (item.newMemberCount / max) * 175;
          const diariesHeight = (item.diaryCreationCount / max) * 175;
          const isHovered = hoveredIndex === index;

          return (
            <g
              key={item.periodStartDate}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch/hover area */}
              <rect
                x={x - 25.5}
                y="10"
                width="105"
                height="200"
                fill="#000"
                opacity="0"
              />
              <rect
                x={x}
                y={210 - usersHeight}
                width="25"
                height={usersHeight}
                rx="3"
                fill="#2878df"
                className="transition-all duration-200"
                style={{ opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1 }}
              />
              <rect
                x={x + 29}
                y={210 - diariesHeight}
                width="25"
                height={diariesHeight}
                rx="3"
                fill="#b4c9e4"
                className="transition-all duration-200"
                style={{ opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1 }}
              />
              <text
                x={x + 27}
                y="232"
                textAnchor="middle"
                fontSize="11"
                className={`transition-colors duration-200 ${isHovered ? "fill-slate-950 font-bold" : "fill-slate-500 font-medium"
                  }`}
              >
                {formatWeekLabel(item.periodStartDate)}
              </text>
            </g>
          );
        })}
        {/* Tooltip Overlay */}
        {hoveredIndex !== null && (
          (() => {
            const item = data[hoveredIndex];
            const x = 78 + hoveredIndex * 105 + 27; // center of group
            const currentMaxHeight = Math.max(
              (item.newMemberCount / max) * 175,
              (item.diaryCreationCount / max) * 175,
            );
            const y = 210 - currentMaxHeight - 15;
            
            const tooltipX = x > 380 ? x - 180 : x - 10;
            const tooltipY = y < 50 ? y + 60 : y;

            return (
              <g className="pointer-events-none drop-shadow-md">
                <rect
                  x={tooltipX}
                  y={tooltipY - 58}
                  width="190"
                  height="66"
                  rx="8"
                  fill="#1e293b"
                />
                <text x={tooltipX + 12} y={tooltipY - 40} fontSize="13" className="fill-white font-bold">
                  {formatWeekLabel(item.periodStartDate)} ~ {formatWeekLabel(item.periodEndDate)}
                </text>
                <text x={tooltipX + 12} y={tooltipY - 23} fontSize="11" className="fill-slate-300">
                  신규 가입: {item.newMemberCount.toLocaleString()}명
                </text>
                <text x={tooltipX + 12} y={tooltipY - 7} fontSize="11" className="fill-slate-300">
                  일기 작성: {item.diaryCreationCount.toLocaleString()}개
                </text>
              </g>
            );
          })()
        )}
      </svg>
      <div className="flex justify-center gap-6 text-xs text-slate-600">
        <Legend color="#2878df">신규 가입</Legend>
        <Legend color="#b4c9e4">일기 작성</Legend>
      </div>
    </div>
  );
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
