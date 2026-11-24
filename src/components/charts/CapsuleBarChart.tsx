'use client';

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatCurrency } from '@/lib/utils';
import { SalesOrder } from '@/types';
import { computeSalesOverviewByDateRange } from '@/lib/salesOverview';
import { Loader } from '@/components/ui/Loader';

interface CapsuleBarChartProps {
  salesRevenue: number;
  stockValuation: number;
  startDate?: string;
  endDate?: string;
  salesOrders?: SalesOrder[];
}

export function CapsuleBarChart({
  startDate = '2026-11-19',
  endDate = '2026-11-25',
  salesOrders = [],
}: CapsuleBarChartProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent Highcharts Color.tweenTo from producing invalid CSS color-mix(url(...), ...) on SVG fills
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
        label="Preparing sales chart..."
        className="h-[280px]"
      />
    );
  }

  // Exact calendar dates & values for the selected range (up to 7 days)
  const { days, fullDates, values: dayValues } = computeSalesOverviewByDateRange(
    startDate,
    endDate,
    salesOrders
  );
  const maxCapacity = 45000; // 45K scale

  // Color configurations from Palette 16, 17, 18, 20 (7 harmonious bars)
  const barConfigs = [
    {
      id: 'orange',
      patternFill: 'url(#pattern-bar-orange)',
      solidColor: '#F59E0B',
      hoverColor: '#FBBF24',
      bgLight: '#FEF3C7',
      bgDark: '#451A03',
    },
    {
      id: 'magenta',
      patternFill: 'url(#pattern-bar-magenta)',
      solidColor: '#EC4899',
      hoverColor: '#F472B6',
      bgLight: '#FCE7F6',
      bgDark: '#500724',
    },
    {
      id: 'green',
      patternFill: 'url(#pattern-bar-green)',
      solidColor: '#84CC16',
      hoverColor: '#A3E635',
      bgLight: '#EDFCD2',
      bgDark: '#14532D',
    },
    {
      id: 'aqua',
      patternFill: 'url(#pattern-bar-aqua)',
      solidColor: '#14B8A6',
      hoverColor: '#2DD4BF',
      bgLight: '#D5F7F1',
      bgDark: '#042F2E',
    },
    {
      id: 'coral',
      patternFill: 'url(#pattern-bar-coral)',
      solidColor: '#F43F5E',
      hoverColor: '#FB7185',
      bgLight: '#FFE2E4',
      bgDark: '#4C0519',
    },
    {
      id: 'lavender',
      patternFill: 'url(#pattern-bar-lavender)',
      solidColor: '#8B5CF6',
      hoverColor: '#A78BFA',
      bgLight: '#EDE9FE',
      bgDark: '#2E1065',
    },
    {
      id: 'emerald',
      patternFill: 'url(#pattern-bar-emerald)',
      solidColor: '#10B981',
      hoverColor: '#34D399',
      bgLight: '#D1FAE5',
      bgDark: '#064E3B',
    },
  ];

  // Background track data (full capsule height)
  const backgroundTracks = days.map(() => maxCapacity);

  // Foreground series items with explicitly designated hover colors matching their bar palette
  const seriesForeground = dayValues.map((val, idx) => {
    const config = barConfigs[idx % barConfigs.length];
    return {
      name: days[idx],
      fullDate: fullDates[idx],
      y: val,
      color: config.patternFill,
      borderColor: 'transparent',
      // Highcharts state hover configuration to prevent turning black on hover:
      states: {
        normal: {
          animation: false,
        },
        hover: {
          enabled: true,
          animation: false,
          color: config.hoverColor,
          brightness: 0,
          borderColor: config.solidColor,
          borderWidth: 2,
        },
      },
    };
  });

  const options: any = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 280,
      spacing: [15, 10, 10, 10],
      // Omit chart.animation so state transitions obey states.hover.animation: false synchronously
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: days,
      crosshair: false,
      lineColor: isDark ? '#143840' : '#E0ECE9',
      tickColor: isDark ? '#143840' : '#E0ECE9',
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
      max: 45000,
      tickPositions: [0, 5000, 10000, 15000, 30000, 45000],
      title: {
        text: undefined,
      },
      gridLineColor: isDark ? 'rgba(20, 56, 64, 0.4)' : '#F0F5F4',
      gridLineDashStyle: 'Dash',
      labels: {
        formatter: function (this: any) {
          if (this.value === 0) return '0K';
          return `${this.value / 1000}K`;
        },
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
      useHTML: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      shadow: false,
      formatter: function (this: any) {
        const fullDateLabel =
          this.point?.options?.fullDate ||
          this.point?.fullDate ||
          fullDates[Number(this.x)] ||
          days[Number(this.x)] ||
          this.x;
        const displayAmount = formatCurrency(Number(this.y));
        return `
          <div style="background: #092B2E; color: #FFFFFF; padding: 8px 16px; border-radius: 12px; font-family: inherit; box-shadow: 0 12px 28px -4px rgba(0,0,0,0.5); border: 1px solid #144E54; text-align: center; position: relative; z-index: 50;">
            <div style="color: #94A3B8; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">${fullDateLabel}</div>
            <div style="color: #2DD4BF; font-size: 14px; font-weight: 800; margin-top: 2px;">${displayAmount}</div>
          </div>
        `;
      },
    },
    plotOptions: {
      column: {
        grouping: false,
        borderWidth: 0,
        pointWidth: days.length > 5 ? 26 : 32,
        animation: {
          duration: 750,
        },
        states: {
          normal: {
            animation: false,
          },
          hover: {
            enabled: true,
            animation: false,
            brightness: 0,
          },
          inactive: {
            opacity: 0.85,
            animation: false,
          },
        },
      },
    },
    series: [
      // 1. Background capsule track (The soft capsule rounded track from reference image)
      {
        type: 'column',
        name: 'Track',
        data: backgroundTracks,
        color: isDark ? '#0C262C' : '#ECF3F2',
        borderRadius: 16,
        enableMouseTracking: false,
      },
      // 2. Foreground striped capsule bar with protected hover colors
      {
        type: 'column',
        name: 'Daily Sales',
        data: seriesForeground,
        borderRadius: 16,
        animation: {
          duration: 800,
        },
      },
    ],
  };

  return (
    <div className="w-full relative">
      {/* SVG Definitions for the diagonal striped hatched textures matching reference images */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          {/* Mon: Orange / Peach striped */}
          <pattern
            id="pattern-bar-orange"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#3D2415' : '#FDE8D7'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#F59E0B" strokeWidth="3" />
          </pattern>

          {/* Tue: Magenta / Purple striped */}
          <pattern
            id="pattern-bar-magenta"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#3B1736' : '#FCE7F6'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#EC4899" strokeWidth="3" />
          </pattern>

          {/* Wed: Lime / Green striped (Peak like in image) */}
          <pattern
            id="pattern-bar-green"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#233810' : '#EDFCD2'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#84CC16" strokeWidth="3.5" />
          </pattern>

          {/* Thu: Aqua / Turquoise striped */}
          <pattern
            id="pattern-bar-aqua"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#0F3337' : '#D5F7F1'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#14B8A6" strokeWidth="3" />
          </pattern>

          {/* Coral / Salmon striped */}
          <pattern
            id="pattern-bar-coral"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#3D161A' : '#FFE2E4'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#F43F5E" strokeWidth="3" />
          </pattern>

          {/* Lavender / Purple striped */}
          <pattern
            id="pattern-bar-lavender"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#2E1065' : '#EDE9FE'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#8B5CF6" strokeWidth="3" />
          </pattern>

          {/* Emerald / Mint striped */}
          <pattern
            id="pattern-bar-emerald"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill={isDark ? '#064E3B' : '#D1FAE5'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#10B981" strokeWidth="3" />
          </pattern>
        </defs>
      </svg>

      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default CapsuleBarChart;
