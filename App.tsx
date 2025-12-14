import React, { useState, useEffect, useRef } from 'react';
import { AppState, ResourceType } from './types';
import { generateData } from './services/dataService';
import { START_YEAR, END_YEAR } from './constants';
import MapVisualization from './components/MapVisualization';
import DashboardPanel from './components/DashboardPanel';
import TimeSlider from './components/TimeSlider';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentYear: 2024,
    selectedResource: 'Oil',
    isPlaying: false,
    data: {},
    loading: true,
  });

  const timerRef = useRef<number | undefined>(undefined);

  // Load Data on Resource Change
  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));
    // Simulate async processing (like python script running)
    setTimeout(() => {
        const newData = generateData(state.selectedResource);
        setState(prev => ({ ...prev, data: newData, loading: false }));
    }, 500);
  }, [state.selectedResource]);

  // Playback Logic
  useEffect(() => {
    if (state.isPlaying) {
        timerRef.current = window.setInterval(() => {
            setState(prev => {
                if (prev.currentYear >= END_YEAR) {
                    return { ...prev, isPlaying: false, currentYear: START_YEAR }; // Loop or Stop
                }
                return { ...prev, currentYear: prev.currentYear + 1 };
            });
        }, 500); // 500ms per year
    } else {
        if (timerRef.current !== undefined) {
          window.clearInterval(timerRef.current);
          timerRef.current = undefined;
        }
    }
    return () => {
        if (timerRef.current !== undefined) {
          window.clearInterval(timerRef.current);
        }
    };
  }, [state.isPlaying]);

  const handleYearChange = (year: number) => {
    setState(prev => ({ ...prev, currentYear: year, isPlaying: false }));
  };

  const handleResourceChange = (resource: ResourceType) => {
    setState(prev => ({ ...prev, selectedResource: resource }));
  };

  const togglePlay = () => {
    setState(prev => {
        if (prev.currentYear >= END_YEAR && !prev.isPlaying) {
            return { ...prev, isPlaying: true, currentYear: START_YEAR };
        }
        return { ...prev, isPlaying: !prev.isPlaying };
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden relative font-sans">
      
      {/* Main Map Area */}
      <div className="flex-1 relative z-0">
        {!state.loading && (
            <MapVisualization 
                data={state.data} 
                currentYear={state.currentYear} 
            />
        )}
        
        {/* Loading Overlay */}
        {state.loading && (
            <div className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center flex-col">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-cyan-400 font-mono animate-pulse">PROCESSING GLOBAL DATA...</div>
            </div>
        )}
      </div>

      {/* Floating Dashboard Panel */}
      <DashboardPanel 
        currentYear={state.currentYear}
        resourceType={state.selectedResource}
        globalData={state.data}
        onResourceChange={handleResourceChange}
      />

      {/* Bottom Timeline Control */}
      <TimeSlider 
        currentYear={state.currentYear}
        onChange={handleYearChange}
        isPlaying={state.isPlaying}
        onTogglePlay={togglePlay}
      />
    </div>
  );
};

export default App;