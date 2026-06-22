"use client";

import { Search } from "lucide-react";
import { type TableRowData } from "../model/statistics-data";

interface StatsTableProps {
  columns: string[];
  tableData: TableRowData[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StatsTable({
  columns,
  tableData,
  searchQuery,
  onSearchChange,
}: StatsTableProps) {
  // Filter rows by date or by total/conversion
  const filteredData = tableData.filter((row) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      row.date.toLowerCase().includes(query) ||
      row.col1.toLowerCase().includes(query) ||
      row.col5.toLowerCase().includes(query)
    );
  });

  const getAlignClass = (idx: number) => {
    if (idx === 0) return "text-left";
    if (idx === 4) return "text-center";
    return "text-right";
  };

  return (
    <div className="dashboard-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-slate-700">날짜별 상세 데이터</h2>
        
        {/* Search Input */}
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            type="text"
            placeholder="데이터 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
            aria-label="데이터 검색"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left" aria-label="상세 통계 데이터">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col}
                  className={`px-6 py-3.5 font-semibold text-slate-600 ${getAlignClass(idx)}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 font-medium">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const isPeak = !!row.isPeak;
                const rowValues = [row.date, row.col1, row.col2, row.col3, row.col4, row.col5];

                return (
                  <tr
                    key={row.date}
                    className={`transition-colors duration-150 hover:bg-slate-50/70 ${
                      isPeak ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {rowValues.map((val, idx) => {
                      const alignClass = getAlignClass(idx);
                      
                      // Custom styles per cell type
                      let cellContent = <span>{val}</span>;
                      let cellStyle = "text-slate-600 font-medium";

                      if (idx === 0 || idx === 1) {
                        cellStyle = isPeak ? "text-blue-600 font-bold" : "text-slate-900 font-medium";
                      } else if (idx === 4) {
                        cellContent = (
                          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {val}
                          </span>
                        );
                        cellStyle = "";
                      }

                      return (
                        <td
                          key={idx}
                          className={`px-6 py-4 whitespace-nowrap ${alignClass} ${cellStyle}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
