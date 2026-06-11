export interface WeatherPoint {
  lat: number;
  lon: number;
  elevation: number;
  timezone: string;
  current: CurrentWeather;
  hourly?: HourlyWeather;
  daily?: DailyWeather;
}

export interface CurrentWeather {
  time: string;
  temperature2m: number;
  relativeHumidity2m: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
  precipitation: number;
  weatherCode: number;
  visibility: number;
  cloudCover: number;
  pressureMsl: number;
}

export interface HourlyWeather {
  time: string[];
  temperature2m: number[];
  precipitation: number[];
  windSpeed10m: number[];
  windDirection10m: number[];
  visibility: number[];
  weatherCode: number[];
}

export interface DailyWeather {
  time: string[];
  temperature2mMax: number[];
  temperature2mMin: number[];
  precipitationSum: number[];
  windSpeed10mMax: number[];
  weatherCode: number[];
  precipitationProbabilityMax: number[];
}

/** WMO Weather Code → human-readable description */
export const WMO_CODES: Record<number, string> = {
  0: "clear_sky",
  1: "mainly_clear",
  2: "partly_cloudy",
  3: "overcast",
  45: "fog",
  48: "rime_fog",
  51: "light_drizzle",
  53: "moderate_drizzle",
  55: "dense_drizzle",
  61: "light_rain",
  63: "moderate_rain",
  65: "heavy_rain",
  71: "light_snow",
  73: "moderate_snow",
  75: "heavy_snow",
  80: "light_showers",
  81: "moderate_showers",
  82: "violent_showers",
  95: "thunderstorm",
  96: "thunderstorm_hail",
  99: "thunderstorm_heavy_hail",
};

/** Regions to monitor — oblasts + major cities */
export const UKRAINE_MONITORING_POINTS: { name: string; nameUk: string; lat: number; lon: number }[] = [
  { name: "Kyiv", nameUk: "Київ", lat: 50.45, lon: 30.52 },
  { name: "Kharkiv", nameUk: "Харків", lat: 49.99, lon: 36.23 },
  { name: "Odesa", nameUk: "Одеса", lat: 46.48, lon: 30.74 },
  { name: "Dnipro", nameUk: "Дніпро", lat: 48.46, lon: 35.05 },
  { name: "Zaporizhzhia", nameUk: "Запоріжжя", lat: 47.84, lon: 35.14 },
  { name: "Lviv", nameUk: "Львів", lat: 49.84, lon: 24.03 },
  { name: "Mykolaiv", nameUk: "Миколаїв", lat: 46.97, lon: 31.99 },
  { name: "Kherson", nameUk: "Херсон", lat: 46.64, lon: 32.62 },
  { name: "Sumy", nameUk: "Суми", lat: 50.91, lon: 34.80 },
  { name: "Chernihiv", nameUk: "Чернігів", lat: 51.50, lon: 31.29 },
];
