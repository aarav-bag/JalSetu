// Open-Meteo weather service — free, no API key required
// Docs: https://open-meteo.com/en/docs

export interface WeatherForecastDay {
  day: string;
  temperature: string;
  weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  rainChance: number;
}

export interface WeatherResult {
  message: string;
  advice: string;
  forecast: WeatherForecastDay[];
  location: { lat: number; lon: number };
}

// WMO weather code → app weather type
function wmoToWeather(code: number): "sunny" | "cloudy" | "rainy" | "partly-cloudy" {
  if (code === 0) return "sunny";
  if (code <= 2) return "partly-cloudy";
  if (code <= 48) return "cloudy";
  return "rainy"; // 51+ covers drizzle, rain, snow, thunderstorms
}

function getDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function buildMessage(forecast: WeatherForecastDay[]): { message: string; advice: string } {
  const rainyDays = forecast.filter(d => d.weather === "rainy");
  const today = forecast[0];

  if (rainyDays.length === 0) {
    return {
      message: `Clear skies ahead — ${today.temperature} today`,
      advice: "Good time to irrigate. Schedule watering early morning to reduce evaporation.",
    };
  }

  if (rainyDays[0].day === "Today") {
    return {
      message: "Rain expected today",
      advice: "Skip irrigation today. Let rainfall naturally water your crops.",
    };
  }

  if (rainyDays[0].day === "Tomorrow") {
    return {
      message: "Rain forecast tomorrow",
      advice: "Delay irrigation by a day to conserve water and energy.",
    };
  }

  return {
    message: `Rain likely ${rainyDays[0].day} (${rainyDays[0].rainChance}% chance)`,
    advice: "Plan irrigation before the rain arrives to maximize soil moisture.",
  };
}

export async function fetchRealWeather(lat: number, lon: number): Promise<WeatherResult> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,precipitation_probability_max,weathercode` +
    `&forecast_days=3&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const { daily } = data;

  const forecast: WeatherForecastDay[] = daily.time.map((dateStr: string, i: number) => ({
    day: getDayLabel(dateStr, i),
    temperature: `${Math.round(daily.temperature_2m_max[i])}°C`,
    weather: wmoToWeather(daily.weathercode[i]),
    rainChance: daily.precipitation_probability_max[i] ?? 0,
  }));

  const { message, advice } = buildMessage(forecast);

  return { message, advice, forecast, location: { lat, lon } };
}

// Default location: New Delhi, India (fallback when user doesn't share location)
export async function fetchDefaultWeather(): Promise<WeatherResult> {
  return fetchRealWeather(28.6139, 77.2090);
}
