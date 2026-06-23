"use client";

import { useState } from "react";

import type { ActiveUserDailyPoint } from "../model/active-user-data";

interface DauLineChartProps {
  points: ActiveUserDailyPoint[];
  peakDate: string | null;
}

function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

function formatShortDate(date: string): string {
  return date.slice(5).replace("-", ".");
}

function getScaleMaximum(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatTick(value: number): string {
  if (value >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.round(value).toLocaleString();
}

export function DauLineChart({ points, peakDate }: DauLineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm font-medium text-slate-500">
        조회 기간의 활성 사용자 데이터가 없습니다.
      </div>
    );
  }

  const width = 760;
  const height = 300;
  const left = 56;
  const right = 24;
  const top = 24;
  const bottom = 54;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxScale = getScaleMaximum(
    Math.max(...points.map((point) => point.dau)),
  );
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => maxScale * ratio,
  );
  const xFor = (index: number) =>
    points.length === 1
      ? left + chartWidth / 2
      : left + (index / (points.length - 1)) * chartWidth;
  const yFor = (value: number) =>
    top + chartHeight - (value / maxScale) * chartHeight;
  const linePoints = points
    .map((point, index) => `${xFor(index)},${yFor(point.dau)}`)
    .join(" ");
  const labelInterval =
    points.length <= 7 ? 1 : points.length <= 30 ? 5 : 14;

  return (
    <div className="relative">
      <div className="mb-2 flex justify-end">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="size-2.5 rounded-full bg-blue-600" aria-hidden="true" />
          DAU
        </span>
      </div>

      <svg
        className="h-[300px] w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="일별 DAU 선 차트"
      >
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={tick === 0 ? undefined : "4 4"}
              />
              <text
                x={left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                className="fill-slate-400 font-medium"
              >
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        <polyline
          points={linePoints}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point, index) => {
          const x = xFor(index);
          const y = yFor(point.dau);
          const isPeak = point.date === peakDate;
          const isActive = activeIndex === index;
          const showLabel =
            index % labelInterval === 0 || index === points.length - 1;

          return (
            <g key={point.date}>
              {showLabel && (
                <text
                  x={x}
                  y={height - 22}
                  textAnchor="middle"
                  fontSize="11"
                  className="fill-slate-400 font-medium"
                >
                  {formatShortDate(point.date)}
                </text>
              )}
              <g
                role="button"
                tabIndex={0}
                aria-label={`${formatDate(point.date)} DAU ${point.dau.toLocaleString()}명${isPeak ? ", 최대 DAU" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                className="cursor-pointer outline-none"
              >
                <circle cx={x} cy={y} r="12" fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={isPeak ? 6 : isActive ? 5 : 4}
                  fill={isPeak ? "#f97316" : "#2563eb"}
                  stroke="white"
                  strokeWidth="2.5"
                />
              </g>
            </g>
          );
        })}

        {activeIndex !== null &&
          (() => {
            const point = points[activeIndex];
            const pointX = xFor(activeIndex);
            const pointY = yFor(point.dau);
            const tooltipWidth = 142;
            const tooltipX = Math.min(
              Math.max(pointX - tooltipWidth / 2, left),
              width - right - tooltipWidth,
            );
            const tooltipY = Math.max(pointY - 68, top);

            return (
              <g className="pointer-events-none drop-shadow-md">
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height="52"
                  rx="7"
                  fill="#1e293b"
                />
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 20}
                  fontSize="11"
                  className="fill-white font-bold"
                >
                  {formatDate(point.date)}
                </text>
                <text
                  x={tooltipX + 12}
                  y={tooltipY + 39}
                  fontSize="11"
                  className="fill-slate-200 font-medium"
                >
                  DAU {point.dau.toLocaleString()}명
                </text>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
