import { CountryData, DataPoint, ResourceType } from "../types";
import { START_YEAR, END_YEAR, CURRENT_REAL_YEAR } from "../constants";

// Mock Data Configuration to simulate the CSV
// Real-world approximations for demonstration
const INITIAL_DATA: Record<string, { reserves: number; consumption: number; growth: number }> = {
  USA: { reserves: 68.8, consumption: 0.8, growth: 0.01 },
  CHN: { reserves: 26.0, consumption: 0.7, growth: 0.04 },
  RUS: { reserves: 107.8, consumption: 0.15, growth: 0.005 },
  SAU: { reserves: 297.5, consumption: 0.15, growth: 0.02 },
  IND: { reserves: 4.5, consumption: 0.23, growth: 0.06 },
  CAN: { reserves: 170.3, consumption: 0.1, growth: 0.01 },
  BRA: { reserves: 12.7, consumption: 0.11, growth: 0.02 },
  VEN: { reserves: 303.8, consumption: 0.05, growth: -0.01 }, // High reserves, low consumption
  IRN: { reserves: 157.8, consumption: 0.08, growth: 0.01 },
  IRQ: { reserves: 145.0, consumption: 0.04, growth: 0.02 },
  KWT: { reserves: 101.5, consumption: 0.03, growth: 0.01 },
  ARE: { reserves: 97.8, consumption: 0.04, growth: 0.02 },
  NGA: { reserves: 37.0, consumption: 0.02, growth: 0.03 },
  GBR: { reserves: 2.5, consumption: 0.06, growth: -0.02 }, // Declining
  DEU: { reserves: 0.2, consumption: 0.09, growth: -0.01 },
  JPN: { reserves: 0.0, consumption: 0.16, growth: -0.01 }, // Pure importer
};

// Helper to generate a full timeline for a country
const generateCountryTimeline = (
  iso: string, 
  initialReserves: number, 
  baseConsumption: number, 
  growthRate: number,
  resourceType: ResourceType
): CountryData => {
  const history: Record<number, DataPoint> = {};
  let currentReserves = initialReserves;
  let currentConsumption = baseConsumption;
  let depletionYear: number | null = null;

  // 1. PAST (1990 - 2023) - Backcasting/Interpolation simulation
  for (let year = START_YEAR; year < CURRENT_REAL_YEAR; year++) {
    // Reverse logic for simplicity in this mock: assume consumption was lower/higher based on growth
    const yearDiff = CURRENT_REAL_YEAR - year;
    const pastConsumption = baseConsumption / Math.pow(1 + growthRate, yearDiff);
    
    // In past, reserves were higher
    // Simple mock logic: Reserve = CurrentReserve + Sum of consumption since then
    // For visualization, we just add back a simplified amount
    const pastReserves = currentReserves + (pastConsumption * yearDiff);

    history[year] = {
      year,
      consumption: pastConsumption,
      reserves: Math.max(0, pastReserves),
      isDepleted: false
    };
  }

  // 2. FUTURE (2024 - 2050) - Prediction Logic (CAGR)
  // Logic: Future Reserves(N) = Reserves(N-1) - Consumption(N)
  
  // Set the 2023 baseline
  history[CURRENT_REAL_YEAR - 1] = {
      year: CURRENT_REAL_YEAR - 1,
      consumption: baseConsumption,
      reserves: currentReserves,
      isDepleted: currentReserves <= 0
  };

  let loopReserves = currentReserves;
  let loopConsumption = baseConsumption;

  for (let year = CURRENT_REAL_YEAR; year <= END_YEAR; year++) {
    // Apply Growth
    loopConsumption = loopConsumption * (1 + growthRate);
    
    // Apply Depletion
    loopReserves = loopReserves - loopConsumption;

    const isDepleted = loopReserves <= 0;
    
    if (isDepleted && depletionYear === null) {
      depletionYear = year;
    }

    history[year] = {
      year,
      consumption: loopConsumption,
      reserves: Math.max(0, loopReserves),
      isDepleted: isDepleted
    };
  }

  return {
    id: iso,
    name: iso, // In a real app, map ISO to Name
    history,
    depletionYear
  };
};

export const generateData = (resource: ResourceType): Record<string, CountryData> => {
  const data: Record<string, CountryData> = {};
  
  // Modifiers based on resource type to vary the data
  let reserveMod = 1;
  let consumptionMod = 1;

  if (resource === 'Coal') {
    reserveMod = 15; // Coal is abundant in tonnage
    consumptionMod = 5;
  } else if (resource === 'Gas') {
    reserveMod = 3; 
    consumptionMod = 2;
  }

  Object.entries(INITIAL_DATA).forEach(([iso, stats]) => {
    // Add some random noise for "Interpolation" feel
    const noise = (Math.random() * 0.2) - 0.1; 
    
    data[iso] = generateCountryTimeline(
      iso, 
      stats.reserves * reserveMod, 
      stats.consumption * consumptionMod, 
      stats.growth + noise,
      resource
    );
  });

  return data;
};
