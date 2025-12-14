export type ResourceType = 'Oil' | 'Coal' | 'Gas';

export interface DataPoint {
  year: number;
  consumption: number;
  reserves: number;
  isDepleted: boolean;
}

export interface CountryData {
  id: string; // ISO3 code
  name: string;
  history: Record<number, DataPoint>; // Key is year
  depletionYear: number | null; // Null if not depleted by 2050
}

export interface GlobalStats {
  totalReserves: number;
  avgDepletionYear: number;
  criticalCountries: number;
}

export interface AppState {
  currentYear: number;
  selectedResource: ResourceType;
  isPlaying: boolean;
  data: Record<string, CountryData>; // Key is ISO3 code
  loading: boolean;
}
