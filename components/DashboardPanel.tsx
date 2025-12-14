import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ResourceType, CountryData, DataPoint } from '../types';
import { COLORS, UNITS, CURRENT_REAL_YEAR } from '../constants';

interface DashboardPanelProps {
  currentYear: number;
  resourceType: ResourceType;
  globalData: Record<string, CountryData>;
  onResourceChange: (r: ResourceType) => void;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ currentYear, resourceType, globalData, onResourceChange }) => {
  
  // Calculate Global Stats for the current year
  const stats = React.useMemo(() => {
    let totalReserves = 0;
    let depletedCount = 0;
    let totalConsumption = 0;
    let chartDataMap: Record<number, { year: number; reserves: number; consumption: number }> = {};

    Object.values(globalData).forEach((country: CountryData) => {
      const yearData = country.history[currentYear];
      if (yearData) {
        totalReserves += yearData.reserves;
        totalConsumption += yearData.consumption;
        if (yearData.isDepleted) depletedCount++;
      }

      // Aggregate for chart
      Object.values(country.history).forEach((point: DataPoint) => {
        if (!chartDataMap[point.year]) {
            chartDataMap[point.year] = { year: point.year, reserves: 0, consumption: 0 };
        }
        chartDataMap[point.year].reserves += point.reserves;
        chartDataMap[point.year].consumption += point.consumption;
      });
    });

    return {
      totalReserves,
      depletedCount,
      totalConsumption,
      chartData: Object.values(chartDataMap).sort((a, b) => a.year - b.year)
    };
  }, [currentYear, globalData]);

  const dDay = stats.chartData.find(d => d.reserves <= 0)?.year || "2050+";

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-slate-900/90 backdrop-blur-xl border-l border-cyan-500/30 p-6 flex flex-col z-[1000] overflow-y-auto">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-1">
        EcoTimeline
      </h1>
      <p className="text-xs text-slate-400 mb-6 font-mono">GLOBAL RESOURCE MONITOR</p>

      {/* Resource Selector */}
      <div className="flex gap-2 mb-8 bg-slate-800 p-1 rounded-lg">
        {(['Oil', 'Coal', 'Gas'] as ResourceType[]).map((r) => (
          <button
            key={r}
            onClick={() => onResourceChange(r)}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-md transition-all ${
              resourceType === r 
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Remaining Reserves</p>
          <p className="text-2xl font-mono font-bold text-white">
            {stats.totalReserves.toFixed(1)} <span className="text-xs text-slate-500">{UNITS[resourceType].split(' ')[0]}</span>
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
          <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">Global Depletion D-Day</p>
          <p className="text-3xl font-mono font-bold text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">
            {dDay}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
            <div>
                 <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Depleted Nations</p>
                 <p className="text-xl font-mono font-bold text-white">{stats.depletedCount}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${stats.depletedCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <p className="text-xs text-slate-400 mb-2">GLOBAL TREND ({resourceType})</p>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
                <defs>
                <linearGradient id="colorReserves" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <XAxis dataKey="year" hide />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#06b6d4' }}
                    labelStyle={{ color: '#94a3b8' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="reserves" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorReserves)" 
                    isAnimationActive={false}
                />
                {/* Reference line for current year could go here */}
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-4 text-[10px] text-slate-600 font-mono text-center">
        PREDICTION MODEL: LINEAR CAGR + INTERPOLATION
      </div>
    </div>
  );
};

export default DashboardPanel;