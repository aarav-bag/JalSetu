import { useRoute, Link } from "wouter";
import { ArrowLeft, BarChart2, Download } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";

const ReportDetails = () => {
  const { darkMode } = useTheme();
  const { toast } = useToast();
  const [, params] = useRoute("/report-details/:type");
  const reportType = params?.type ? decodeURIComponent(params.type) : "Water Usage";

  const waterUsageData = [
    { name: "Jan", irrigation: 40, rainfall: 24 },
    { name: "Feb", irrigation: 30, rainfall: 28 },
    { name: "Mar", irrigation: 25, rainfall: 32 },
    { name: "Apr", irrigation: 35, rainfall: 20 },
    { name: "May", irrigation: 50, rainfall: 15 },
    { name: "Jun", irrigation: 45, rainfall: 10 },
    { name: "Jul", irrigation: 60, rainfall: 5 },
  ];
  const soilHealthData = [
    { name: "Jan", moisture: 75, nitrogen: 40, phosphorus: 30 },
    { name: "Feb", moisture: 80, nitrogen: 45, phosphorus: 32 },
    { name: "Mar", moisture: 70, nitrogen: 42, phosphorus: 28 },
    { name: "Apr", moisture: 65, nitrogen: 38, phosphorus: 25 },
    { name: "May", moisture: 60, nitrogen: 35, phosphorus: 24 },
    { name: "Jun", moisture: 55, nitrogen: 32, phosphorus: 22 },
    { name: "Jul", moisture: 50, nitrogen: 30, phosphorus: 20 },
  ];
  const seasonalData = [
    { name: "2022", yield: 80, efficiency: 65, water: 70 },
    { name: "2023", yield: 85, efficiency: 70, water: 75 },
    { name: "2024", yield: 90, efficiency: 75, water: 80 },
    { name: "2025", yield: 95, efficiency: 80, water: 85 },
  ];

  const reportData = reportType === "Water Usage" ? waterUsageData : reportType === "Soil Health" ? soilHealthData : seasonalData;

  const getAnalysis = () => {
    switch (reportType) {
      case "Water Usage": return "Water usage trends show increasing irrigation needs in drier months. Consider optimizing schedules and investing in rainwater harvesting.";
      case "Soil Health": return "Soil moisture levels are declining. Nitrogen and phosphorus need to be maintained. Consider adding organic matter to improve soil structure.";
      default: return "Crop yields have improved year-over-year. Water efficiency has increased, showing positive returns on your smart irrigation investment.";
    }
  };

  const lineColors: Record<string, string[]> = {
    "Water Usage": ["#3b82f6", "#60a5fa"],
    "Soil Health": ["#10b981", "#34d399", "#6ee7b7"],
    "Seasonal Analytics": ["#f59e0b", "#fbbf24", "#fcd34d"],
  };
  const colors = lineColors[reportType] || lineColors["Water Usage"];

  const tickColor = darkMode ? '#e5e7eb' : '#4b5563';
  const tooltipBg = darkMode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.95)';
  const tooltipBorder = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(200,210,240,0.6)';

  const dataKeys = Object.keys(reportData[0]).filter(k => k !== "name");

  return (
    <PageShell>
      <Header />
      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        <div className="flex items-center mb-5">
          <Link href="/reports" className="mr-3">
            <div className="h-9 w-9 rounded-xl glass-tile flex items-center justify-center shadow-sm">
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-white/70" />
            </div>
          </Link>
          <h1 className="text-xl font-bold card-heading">{reportType} Report</h1>
        </div>

        <div className="space-y-5 slide-in-right">
          {/* Chart card */}
          <div className="glass-card rounded-[1.5rem] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-blue flex items-center justify-center shadow-md">
                <BarChart2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold card-heading">{reportType} Details</h2>
            </div>

            <div className="h-72 w-full rounded-2xl overflow-hidden glass-tile p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}`, color: tickColor, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }} />
                  <Legend wrapperStyle={{ color: tickColor, fontSize: 11 }} />
                  {dataKeys.map((key, i) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={colors[i] || colors[0]}
                      strokeWidth={2} activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1200} animationBegin={i * 200} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Analysis */}
            <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h3 className="font-semibold card-value mb-1.5 text-sm">Analysis</h3>
              <p className="text-sm card-body leading-relaxed">{getAnalysis()}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <Link href="/reports">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold card-value glass-tile transition-all hover:scale-105">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              </Link>
              <button
                onClick={() => toast({ title: "Report Exported", description: `${reportType} report exported to PDF.` })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 gradient-blue shadow-md shadow-blue-500/25">
                <Download className="h-3.5 w-3.5" /> Export Report
              </button>
            </div>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </PageShell>
  );
};

export default ReportDetails;
