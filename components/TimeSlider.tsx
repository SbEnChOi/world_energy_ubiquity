import React from 'react';
import { START_YEAR, END_YEAR, COLORS } from '../constants';

interface TimeSliderProps {
  currentYear: number;
  onChange: (year: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ currentYear, onChange, isPlaying, onTogglePlay }) => {
  
  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md border-t border-cyan-500/30 p-4 flex items-center gap-4 z-[1000] relative">
      <button
        onClick={onTogglePlay}
        className="flex items-center justify-center w-12 h-12 rounded-full border border-cyan-400 text-cyan-400 hover:bg-cyan-500/20 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between text-xs text-cyan-200/70 font-mono mb-2">
            <span>{START_YEAR}</span>
            <span className="text-xl text-cyan-400 font-bold glow">{currentYear}</span>
            <span>{END_YEAR}</span>
        </div>
        <input
          type="range"
          min={START_YEAR}
          max={END_YEAR}
          value={currentYear}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none"
        />
        <div className="w-full flex justify-between mt-1 h-2">
            {[1990, 2000, 2010, 2020, 2030, 2040, 2050].map(y => (
                <div key={y} className="w-px h-full bg-slate-600"></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TimeSlider;
