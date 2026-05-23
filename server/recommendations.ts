// ──────────────────────────────────────────────────────────────────
// Smart Recommendation Engine
// Generates personalised, data-driven irrigation recommendations
// from real sensor readings — 100% free, no API key required.
// ──────────────────────────────────────────────────────────────────

export type Priority = "high" | "medium" | "low";
export type Category = "water-quality" | "soil" | "weather" | "irrigation" | "pest" | "nutrient";

export interface Recommendation {
  id: string;
  priority: Priority;
  category: Category;
  title: string;
  description: string;
  action: string;
  icon: string;          // lucide icon name hint
  metric?: string;       // e.g. "pH 6.2" shown as a badge
  confidence: number;    // 0–100%
}

export interface SensorInput {
  // Water quality
  ph?: number;
  tds?: number;           // ppm
  waterTemp?: number;     // °C

  // Soil
  soilMoistureAvg?: number;       // %
  fields?: Array<{ name: string; value: number; status: string }>;

  // Weather
  rainChanceTomorrow?: number;    // %
  forecastTemp?: number;          // °C max for today
  weatherCondition?: string;      // "sunny" | "rainy" | "partly-cloudy" | "cloudy"

  // Context
  hour?: number;          // 0-23, used for timing advice
}

function uid(seed: string) {
  return seed.toLowerCase().replace(/\s+/g, "-");
}

export function generateRecommendations(input: SensorInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const h = input.hour ?? new Date().getHours();

  // ── Water Quality ────────────────────────────────────────────────
  if (input.ph !== undefined) {
    const ph = input.ph;
    if (ph < 5.5) {
      recs.push({
        id: uid("ph-very-low"),
        priority: "high",
        category: "water-quality",
        title: "Water is Too Acidic",
        description: `Your water pH is ${ph.toFixed(1)} — well below the safe range of 6.0–7.5. Acidic water can damage roots and lock out key nutrients.`,
        action: "Add agricultural lime or wood ash to your water source to raise pH before irrigating.",
        icon: "flask-conical",
        metric: `pH ${ph.toFixed(1)}`,
        confidence: 96,
      });
    } else if (ph < 6.0) {
      recs.push({
        id: uid("ph-low"),
        priority: "medium",
        category: "water-quality",
        title: "Slightly Acidic Water",
        description: `pH is ${ph.toFixed(1)}, slightly below ideal (6.0–7.0). Most crops tolerate this, but sensitive plants like tomatoes may show stress.`,
        action: "Add a small amount of potassium bicarbonate to the irrigation water.",
        icon: "flask-conical",
        metric: `pH ${ph.toFixed(1)}`,
        confidence: 88,
      });
    } else if (ph <= 7.0) {
      recs.push({
        id: uid("ph-optimal"),
        priority: "low",
        category: "water-quality",
        title: "Water pH is Optimal",
        description: `pH ${ph.toFixed(1)} is in the ideal range (6.0–7.0). Nutrients are fully available and crops will absorb water efficiently.`,
        action: "No treatment needed. Continue current irrigation schedule.",
        icon: "check-circle",
        metric: `pH ${ph.toFixed(1)}`,
        confidence: 98,
      });
    } else if (ph <= 7.8) {
      recs.push({
        id: uid("ph-slightly-high"),
        priority: "medium",
        category: "water-quality",
        title: "Slightly Alkaline Water",
        description: `pH ${ph.toFixed(1)} is above the ideal range. Prolonged use can cause iron and manganese deficiency in crops.`,
        action: "Add a small amount of food-grade citric acid or sulfur to lower pH before irrigating.",
        icon: "flask-conical",
        metric: `pH ${ph.toFixed(1)}`,
        confidence: 85,
      });
    } else {
      recs.push({
        id: uid("ph-high"),
        priority: "high",
        category: "water-quality",
        title: "Water Too Alkaline",
        description: `pH ${ph.toFixed(1)} is dangerously high. Most crops will show yellowing leaves and stunted growth if this water is used directly.`,
        action: "Treat water with diluted sulfuric acid or use a pH-down solution. Target pH 6.0–7.0 before use.",
        icon: "alert-triangle",
        metric: `pH ${ph.toFixed(1)}`,
        confidence: 95,
      });
    }
  }

  if (input.tds !== undefined) {
    const tds = input.tds;
    if (tds < 150) {
      recs.push({
        id: uid("tds-low"),
        priority: "low",
        category: "nutrient",
        title: "Very Pure Water — Add Minerals",
        description: `TDS is only ${tds} ppm — very pure water lacks dissolved minerals crops need. Distilled or RO water can cause nutrient deficiencies over time.`,
        action: "Add a balanced water-soluble fertiliser or mineral supplement to the irrigation water.",
        icon: "droplets",
        metric: `${tds} ppm TDS`,
        confidence: 82,
      });
    } else if (tds <= 450) {
      recs.push({
        id: uid("tds-good"),
        priority: "low",
        category: "water-quality",
        title: "Excellent Water Mineral Content",
        description: `TDS of ${tds} ppm is ideal — water carries enough dissolved minerals for healthy crop growth without buildup risk.`,
        action: "No action needed. Your water source is well-suited for irrigation.",
        icon: "check-circle",
        metric: `${tds} ppm TDS`,
        confidence: 97,
      });
    } else if (tds <= 700) {
      recs.push({
        id: uid("tds-moderate"),
        priority: "medium",
        category: "water-quality",
        title: "Moderate Dissolved Solids",
        description: `TDS of ${tds} ppm is acceptable but getting high. Salt buildup in soil can restrict root water uptake over weeks of irrigation.`,
        action: "Flush fields with clean water once a week. Avoid using this water on salt-sensitive crops like strawberries.",
        icon: "droplet",
        metric: `${tds} ppm TDS`,
        confidence: 80,
      });
    } else {
      recs.push({
        id: uid("tds-high"),
        priority: "high",
        category: "water-quality",
        title: "High Salt Content in Water",
        description: `TDS of ${tds} ppm is too high for safe irrigation. Excess salts will damage root systems and reduce yields significantly.`,
        action: "Use a reverse osmosis filter or blend with a lower-TDS water source. Do NOT irrigate salt-sensitive crops with this water.",
        icon: "alert-triangle",
        metric: `${tds} ppm TDS`,
        confidence: 94,
      });
    }
  }

  if (input.waterTemp !== undefined) {
    const wt = input.waterTemp;
    if (wt > 32) {
      recs.push({
        id: uid("water-temp-hot"),
        priority: "high",
        category: "irrigation",
        title: "Water Temperature Too High",
        description: `Irrigation water at ${wt}°C can shock plant roots and promote fungal diseases. Hot water also causes rapid evaporation.`,
        action: "Water only during cooler parts of the day (before 8 AM or after 6 PM). Store water in shade overnight.",
        icon: "thermometer",
        metric: `${wt}°C`,
        confidence: 90,
      });
    } else if (wt > 28) {
      recs.push({
        id: uid("water-temp-warm"),
        priority: "medium",
        category: "irrigation",
        title: "Water is Warm — Time Irrigation Carefully",
        description: `At ${wt}°C, water is warm. Irrigating midday may cause leaf scorch and increases evaporation losses by up to 40%.`,
        action: "Schedule irrigation for early morning (5–8 AM) to maximise absorption and minimise water loss.",
        icon: "thermometer",
        metric: `${wt}°C`,
        confidence: 87,
      });
    }
  }

  // ── Soil Moisture ────────────────────────────────────────────────
  if (input.soilMoistureAvg !== undefined) {
    const sm = input.soilMoistureAvg;
    if (sm < 30) {
      recs.push({
        id: uid("soil-critical"),
        priority: "high",
        category: "soil",
        title: "Critical Soil Dryness — Irrigate Now",
        description: `Average soil moisture is only ${sm}%. At this level, crops are experiencing water stress and may wilt or die within 24 hours.`,
        action: "Begin irrigation immediately. Apply 3–4 cm of water and check moisture again in 4 hours.",
        icon: "alert-triangle",
        metric: `${sm}% moisture`,
        confidence: 98,
      });
    } else if (sm < 45) {
      recs.push({
        id: uid("soil-low"),
        priority: "high",
        category: "soil",
        title: "Soil Moisture Getting Low",
        description: `Soil moisture at ${sm}% is below the recommended 60–80% range. Crops will start showing stress signs within the next 12–24 hours.`,
        action: "Schedule irrigation in the next 6–12 hours. Apply 2–3 cm of water, preferably in the early morning.",
        icon: "droplet",
        metric: `${sm}% moisture`,
        confidence: 93,
      });
    } else if (sm <= 80) {
      recs.push({
        id: uid("soil-optimal"),
        priority: "low",
        category: "soil",
        title: "Soil Moisture is Optimal",
        description: `At ${sm}%, soil moisture is in the ideal range (60–80%). Roots have good access to water and the soil structure is healthy.`,
        action: "No irrigation needed today. Check again in 24–48 hours.",
        icon: "check-circle",
        metric: `${sm}% moisture`,
        confidence: 99,
      });
    } else if (sm <= 90) {
      recs.push({
        id: uid("soil-high"),
        priority: "medium",
        category: "soil",
        title: "Soil is Over-Saturated",
        description: `Soil moisture at ${sm}% is too high. Waterlogged soil drives out oxygen that roots need, leading to root rot and fungal disease.`,
        action: "Stop all irrigation. Open drainage channels if available. Avoid irrigating for at least 48 hours.",
        icon: "alert-triangle",
        metric: `${sm}% moisture`,
        confidence: 91,
      });
    } else {
      recs.push({
        id: uid("soil-flooded"),
        priority: "high",
        category: "soil",
        title: "Flooding Risk — Stop Irrigation",
        description: `Soil moisture at ${sm}% is dangerously high. Root rot, anaerobic bacteria, and fungal infections are likely already developing.`,
        action: "Stop irrigation immediately. Create drainage channels to remove excess water. Inspect crops for root rot signs.",
        icon: "alert-triangle",
        metric: `${sm}% moisture`,
        confidence: 97,
      });
    }
  }

  // Per-field recommendations
  if (input.fields && input.fields.length > 0) {
    input.fields.forEach((field) => {
      if (field.status === "warning" && field.value < 50) {
        recs.push({
          id: uid(`field-${field.name}-low`),
          priority: "medium",
          category: "soil",
          title: `${field.name} Needs Water Soon`,
          description: `${field.name} moisture is at ${field.value}%. This field will reach critical levels within 18–24 hours without irrigation.`,
          action: `Prioritise irrigating ${field.name} early tomorrow morning with 2 cm of water.`,
          icon: "droplet",
          metric: `${field.value}%`,
          confidence: 88,
        });
      } else if (field.status === "danger" || field.value < 35) {
        recs.push({
          id: uid(`field-${field.name}-critical`),
          priority: "high",
          category: "soil",
          title: `${field.name} — Emergency Irrigation`,
          description: `${field.name} is critically dry at ${field.value}%. Crops in this field are likely experiencing severe water stress.`,
          action: `Irrigate ${field.name} immediately with 3–4 cm of water.`,
          icon: "alert-triangle",
          metric: `${field.value}%`,
          confidence: 96,
        });
      }
    });
  }

  // ── Weather-based ─────────────────────────────────────────────────
  if (input.rainChanceTomorrow !== undefined) {
    const rain = input.rainChanceTomorrow;
    if (rain >= 70) {
      recs.push({
        id: uid("weather-heavy-rain"),
        priority: "high",
        category: "weather",
        title: "Heavy Rain Likely — Skip Irrigation",
        description: `There is a ${rain}% chance of significant rainfall tomorrow. Irrigating today would waste water and risk waterlogging.`,
        action: "Cancel or postpone any scheduled irrigation for the next 24–36 hours. Save water and energy.",
        icon: "cloud-rain",
        metric: `${rain}% rain chance`,
        confidence: 90,
      });
    } else if (rain >= 40) {
      recs.push({
        id: uid("weather-moderate-rain"),
        priority: "medium",
        category: "weather",
        title: "Possible Rain Tomorrow",
        description: `A ${rain}% chance of rain is forecast. You may not need to irrigate if rainfall occurs, but it's not guaranteed.`,
        action: "Reduce irrigation volume by 50% today. Monitor soil moisture tomorrow morning before deciding.",
        icon: "cloud",
        metric: `${rain}% rain chance`,
        confidence: 75,
      });
    } else if (rain < 15) {
      recs.push({
        id: uid("weather-dry"),
        priority: "medium",
        category: "weather",
        title: "Dry Weather Ahead",
        description: `Only ${rain}% chance of rain. Hot and dry conditions will increase crop water demands over the next few days.`,
        action: "Increase irrigation frequency and consider mulching to reduce evaporation from soil surface.",
        icon: "sun",
        metric: `${rain}% rain chance`,
        confidence: 85,
      });
    }
  }

  if (input.forecastTemp !== undefined && input.forecastTemp > 38) {
    recs.push({
      id: uid("heat-wave"),
      priority: "high",
      category: "weather",
      title: "Heat Wave Conditions",
      description: `Today's temperature is forecast to hit ${input.forecastTemp}°C. Extreme heat dramatically increases crop water needs and evaporation.`,
      action: "Irrigate before 7 AM and after 7 PM only. Add mulch around plants and increase water quantity by 30%.",
      icon: "sun",
      metric: `${input.forecastTemp}°C`,
      confidence: 93,
    });
  }

  // ── Timing advice ─────────────────────────────────────────────────
  if (h >= 10 && h <= 16) {
    recs.push({
      id: uid("timing-midday"),
      priority: "medium",
      category: "irrigation",
      title: "Avoid Midday Irrigation",
      description: "It's currently midday. Water evaporates up to 40% faster in direct sun, and wet leaves can act as lenses and cause burn spots.",
      action: "Pause irrigation if running. Resume after 6 PM or wait until tomorrow morning (5–8 AM) for best results.",
      icon: "clock",
      metric: `${h}:00`,
      confidence: 85,
    });
  }

  // ── Sort: high first, then medium, then low ───────────────────────
  const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => order[a.priority] - order[b.priority]);

  return recs;
}
