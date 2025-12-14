import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CountryData } from '../types';

interface MapProps {
  data: Record<string, CountryData>;
  currentYear: number;
}

// Map Event Handler to force resize when container changes
const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
};

const MapVisualization: React.FC<MapProps> = ({ data, currentYear }) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Fetch a low-res world GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Failed to load map data", err));
  }, []);

  const getCountryStyle = (feature: any) => {
    const iso = feature.id; // ISO3 from GeoJSON
    const countryData = data[iso];
    
    // Default style (Gray/Dark)
    let fillColor = '#1e293b'; 
    let fillOpacity = 0.5;

    if (countryData) {
        const yearData = countryData.history[currentYear];
        if (yearData) {
            if (yearData.isDepleted) {
                fillColor = '#334155'; // Depleted (Dark Slate)
                fillOpacity = 0.3;
            } else {
                // Calculate intensity based on reserves relative to initial (1990) reserves
                // This creates a fading effect as resources drain
                const initial = countryData.history[1990].reserves;
                const ratio = initial > 0 ? yearData.reserves / initial : 0;
                
                // Cyan to Purple/Red gradient logic handled via opacity for simplicity or custom scale
                // High reserves = High Opacity Cyan
                // Low reserves = Low Opacity or shift to Red
                fillColor = ratio < 0.2 ? '#f43f5e' : '#06b6d4'; // Red if critical, Cyan otherwise
                fillOpacity = 0.3 + (ratio * 0.6); // Min 0.3 opacity
            }
        }
    }

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: '#0f172a', // Border
      fillOpacity,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const iso = feature.id;
    const countryData = data[iso];

    let tooltipContent = `<div class="p-2 font-mono text-xs">
        <strong class="text-cyan-400 text-sm block mb-1">${feature.properties.name}</strong>`;

    if (countryData && countryData.history[currentYear]) {
        const point = countryData.history[currentYear];
        tooltipContent += `
            <div>Reserves: <span class="text-white">${point.reserves.toFixed(2)}</span></div>
            <div>Consumption: <span class="text-white">${point.consumption.toFixed(2)}</span></div>
            ${point.isDepleted ? '<div class="text-rose-500 font-bold mt-1">[DEPLETED]</div>' : ''}
        `;
    } else {
        tooltipContent += `<div class="text-slate-500">No Data</div>`;
    }
    tooltipContent += `</div>`;

    layer.bindTooltip(tooltipContent, {
        className: 'bg-slate-900 border border-cyan-500/30 text-slate-200 shadow-xl',
        sticky: true,
        direction: 'top'
    });
  };

  if (!geoJsonData) return <div className="w-full h-full flex items-center justify-center text-cyan-500">Loading Map Data...</div>;

  return (
    <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#020617' }} 
        zoomControl={false}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
    >
      <TileLayer
        // Using CartoDB Dark Matter for that cyberpunk tech feel (Free)
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <GeoJSON 
        key={`${currentYear}-${Object.keys(data).length}`} // Force re-render when year changes to update styles efficiently
        data={geoJsonData} 
        style={getCountryStyle} 
        onEachFeature={onEachFeature}
      />
      <MapUpdater />
    </MapContainer>
  );
};

export default MapVisualization;
