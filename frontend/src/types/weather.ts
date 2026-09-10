export interface DailyWeatherForecast {
  day: string;
  date: string;
  rainfall_mm: number;
  condition: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  corridor_advisory?: string;
}

export interface DistrictWeatherReport {
  district: string;
  district_name?: string;
  hq: string;
  lat: number;
  lon: number;
  condition: string;
  rainfall_24h_mm: number;
  rainfall_mm?: number;
  rainfall_intensity: 'EXTREME' | 'HEAVY' | 'MODERATE' | 'LIGHT';
  temp_c: number;
  temperature_c?: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  wind_kmh?: number;
  wind_direction: string;
  soil_saturation_pct: number;
  soil_moisture_pct?: number;
  flood_alert_level: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  landslide_risk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  visibility_km: number;
  advisory: string;
  logistics_advisory?: string;
  forecast: DailyWeatherForecast[];
  proximity_km?: number;
  traced_gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface RegionalWeatherSummary {
  status: string;
  station: string;
  date: string;
  condition: string;
  mean_24h_rainfall_mm: number;
  max_24h_rainfall_mm: number;
  peak_hazard_district: string;
  soil_moisture_saturation_pct: number;
  flood_alert_level: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  data_provenance: string;
  monitored_districts_count?: number;
}
