'use client';

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Loader } from '@/components/ui/Loader';

interface GodownStat {
  name: string;
  count: number;
  totalQty: number;
  value: number;
}

interface FacilityCapacityChartProps {
  godownStats: GodownStat[];
  dateRangeLabel?: string;
  dataMultiplier?: number;
}

export default function FacilityCapacityChart({
  godownStats,
  dateRangeLabel = 'This Month',
  dataMultiplier = 1,
}: FacilityCapacityChartProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if ((Highcharts as any).Color) {
      (Highcharts as any).Color.useColorMix = false;
    }
    setMounted(true);
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return (
      <Loader
        variant="chart"
        label="Preparing facility telemetry..."
        className="h-[260px]"
      />
    );
  }

  const mainHub = godownStats.find((g) => g.name.toLowerCase().includes('main')) || {
    name: 'Main Hub',
    count: 7,
    totalQty: 180,
    value: 25000,
  };
  const westWh = godownStats.find((g) => g.name.toLowerCase().includes('west')) || {
    name: 'West Warehouse',
    count: 5,
    totalQty: 95,
    value: 14500,
  };

  // Dynamic utilization metrics anchored around realistic warehouse baselines
  const totalQtyAll = Math.max(1, mainHub.totalQty + westWh.totalQty);
  const mainCurrentCap = Math.min(96, Math.max(42, Math.round((mainHub.totalQty / totalQtyAll) * 100)));
  const westCurrentCap = Math.min(92, Math.max(28, Math.round((westWh.totalQty / totalQtyAll) * 100)));

  const periods = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mainSeriesData = [54, 60, 65, 63, 71, 67, mainCurrentCap].map((v) =>
    Math.min(98, Math.max(15, Math.round(v * (0.9 + dataMultiplier * 0.1))))
  );
  const westSeriesData = [35, 39, 44, 42, 48, 46, westCurrentCap].map((v) =>
    Math.min(94, Math.max(12, Math.round(v * (0.9 + dataMultiplier * 0.1))))
  );

  const options: any = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 255,
      spacing: [12, 10, 6, 6],
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: periods,
      boundaryGap: false,
      lineColor: isDark ? '#143840' : '#E0ECE9',
      tickColor: 'transparent',
      labels: {
        style: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: '11px',
          fontWeight: '600',
        },
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      tickPositions: [0, 25, 50, 75, 100],
      title: {
        text: undefined,
      },
      gridLineColor: isDark ? 'rgba(20, 56, 64, 0.45)' : '#EEF5F3',
      gridLineDashStyle: 'Dash',
      labels: {
        format: '{value}%',
        style: {
          color: isDark ? '#64748B' : '#94A3B8',
          fontSize: '10px',
        },
      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      shadow: false,
      formatter: function (this: any) {
        const points = this.points || [];
        const day = this.x || (points[0] && points[0].key) || '';
        const rows = points
          .map(
            (pt: any) => `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:4px;">
              <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:#E2E8F0;font-weight:600;">
                <span style="width:8px;height:8px;border-radius:9999px;background:${pt.series.color};display:inline-block;"></span>
                ${pt.series.name}
              </span>
              <span style="font-size:12px;font-weight:800;color:#FFFFFF;">${pt.y}% Cap</span>
            </div>`
          )
          .join('');
        return `
          <div style="background:#092B2E;color:#FFFFFF;padding:10px 14px;border-radius:14px;border:1px solid #144E54;box-shadow:0 12px 28px -4px rgba(0,0,0,0.45);min-width:170px;">
            <div style="color:#5EEAD4;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">${dateRangeLabel} • ${day}</div>
            ${rows}
          </div>
        `;
      },
    },
    plotOptions: {
      areaspline: {
        lineWidth: 2.8,
        animation: {
          duration: 850,
        },
        marker: {
          enabled: true,
          radius: 4,
          symbol: 'circle',
          lineWidth: 2,
          lineColor: isDark ? '#0D2026' : '#FFFFFF',
          states: {
            hover: {
              enabled: true,
              radius: 6,
              animation: false,
            },
          },
        },
        states: {
          normal: {
            animation: false,
          },
          hover: {
            enabled: true,
            animation: false,
            lineWidth: 3.4,
            halo: {
              size: 6,
              opacity: 0.2,
            },
          },
          inactive: {
            opacity: 0.75,
            animation: false,
          },
        },
      },
    },
    series: [
      {
        type: 'areaspline',
        name: 'Main Hub (HUB-01)',
        data: mainSeriesData,
        color: '#14B8A6',
        fillColor: 'url(#pattern-area-aqua)',
      },
      {
        type: 'areaspline',
        name: 'West Warehouse (WH-02)',
        data: westSeriesData,
        color: '#84CC16',
        fillColor: 'url(#pattern-area-lime)',
      },
    ],
  };

  return (
    <div className="w-full relative space-y-3">
      {/* SVG Diagonal Hatched Area Textures matching CapsuleBarChart */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <pattern
            id="pattern-area-aqua"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="8"
              height="8"
              fill={isDark ? 'rgba(20, 184, 166, 0.16)' : 'rgba(20, 184, 166, 0.14)'}
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={isDark ? 'rgba(45, 212, 191, 0.35)' : 'rgba(20, 184, 166, 0.35)'}
              strokeWidth="2.5"
            />
          </pattern>

          <pattern
            id="pattern-area-lime"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="8"
              height="8"
              fill={isDark ? 'rgba(132, 204, 22, 0.14)' : 'rgba(132, 204, 22, 0.14)'}
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={isDark ? 'rgba(163, 230, 53, 0.32)' : 'rgba(132, 204, 22, 0.35)'}
              strokeWidth="2.5"
            />
          </pattern>
        </defs>
      </svg>

      {/* Highcharts Line & Area Chart */}
      <HighchartsReact highcharts={Highcharts} options={options} />

      {/* Active Facilities Live Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EFFAF8] dark:bg-[#092227] border border-[#CBE6E1] dark:border-[#144048]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/20 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {mainHub.name}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white dark:bg-[#0D2E35] text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
                  HUB-01
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {mainHub.count} SKUs • {formatNumber(mainHub.totalQty)} units • {formatCurrency(mainHub.value)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className="text-xs font-extrabold text-teal-700 dark:text-teal-300 tabular-nums">
              {mainCurrentCap}%
            </span>
            <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6FBE9] dark:bg-[#132210] border border-[#DDF0B8] dark:border-[#2C471B]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-500 ring-4 ring-lime-500/20 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {westWh.name}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white dark:bg-[#1A2F15] text-lime-700 dark:text-lime-300 border border-lime-200/80 dark:border-lime-800">
                  WH-02
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {westWh.count} SKUs • {formatNumber(westWh.totalQty)} units • {formatCurrency(westWh.value)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <span className="text-xs font-extrabold text-lime-700 dark:text-lime-300 tabular-nums">
              {westCurrentCap}%
            </span>
            <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
