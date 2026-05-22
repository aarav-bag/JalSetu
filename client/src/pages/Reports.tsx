import { BarChart2, ArrowRight, Calendar, FilterX, DropletIcon, Sprout, Cloud, Sun, Leaf, Database } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const Reports = () => {
  const { darkMode } = useTheme();
  const { toast } = useToast();
  const { t } = useLanguage();

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
    { name: "Jan", moisture: 75, nitrogen: 40 },
    { name: "Feb", moisture: 80, nitrogen: 45 },
    { name: "Mar", moisture: 70, nitrogen: 42 },
    { name: "Apr", moisture: 65, nitrogen: 38 },
    { name: "May", moisture: 60, nitrogen: 35 },
    { name: "Jun", moisture: 55, nitrogen: 32 },
    { name: "Jul", moisture: 50, nitrogen: 30 },
  ];
  const seasonalData = [
    { name: "2022", yield: 80, efficiency: 65 },
    { name: "2023", yield: 85, efficiency: 70 },
    { name: "2024", yield: 90, efficiency: 75 },
    { name: "2025", yield: 95, efficiency: 80 },
  ];

  const tickColor = darkMode ? '#e5e7eb' : '#4b5563';
  const tooltipBg = darkMode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)';
  const tooltipBorder = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(200,210,240,0.6)';

  const reports = [
    {
      key: "Water Usage",
      title: t.waterUsage,
      desc: t.waterUsageDesc,
      data: waterUsageData,
      iconBg: "gradient-blue",
      icon: <BarChart2 className="h-8 w-8 text-white" />,
      decorIcon: <DropletIcon className="h-20 w-20 text-blue-400 dark:text-blue-300" />,
      decorIcon2: <Cloud className="h-12 w-12 text-blue-300 dark:text-blue-200" />,
      colors: ["#3b82f6", "#60a5fa"],
      keys: ["irrigation", "rainfall"],
      btnClass: "from-blue-500 to-blue-600",
      gradIds: ["ig1", "ig2"],
    },
    {
      key: "Soil Health",
      title: t.soilHealth,
      desc: t.soilHealthDesc,
      data: soilHealthData,
      iconBg: "gradient-green",
      icon: <Database className="h-8 w-8 text-white" />,
      decorIcon: <Sprout className="h-20 w-20 text-emerald-400 dark:text-emerald-300" />,
      decorIcon2: <Leaf className="h-12 w-12 text-green-400 dark:text-green-300" />,
      colors: ["#10b981", "#34d399"],
      keys: ["moisture", "nitrogen"],
      btnClass: "from-emerald-500 to-green-600",
      gradIds: ["ig3", "ig4"],
    },
    {
      key: "Seasonal Analytics",
      title: t.seasonalAnalytics,
      desc: t.seasonalAnalyticsDesc,
      data: seasonalData,
      iconBg: "gradient-amber",
      icon: <Calendar className="h-8 w-8 text-white" />,
      decorIcon: <Sun className="h-20 w-20 text-amber-400 dark:text-amber-300" />,
      decorIcon2: <Cloud className="h-12 w-12 text-amber-300 dark:text-amber-200" />,
      colors: ["#f59e0b", "#fbbf24"],
      keys: ["yield", "efficiency"],
      btnClass: "from-amber-500 to-yellow-600",
      gradIds: ["ig5", "ig6"],
    },
  ];

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t.reportsTitle}</h1>
            <p className="text-sm page-subtitle font-medium mt-1">{t.reportsSubtitle}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <FilterX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        <div className="space-y-6">
          {reports.map((report, idx) => (
            <div key={report.key} className="glass-card rounded-[1.5rem] overflow-hidden relative scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              {/* Decorative floating icons */}
              <div className="absolute -bottom-4 -right-2 opacity-10 floating" style={{ animationDelay: '0.3s' }}>
                {report.decorIcon}
              </div>
              <div className="absolute top-4 right-4 opacity-10 floating" style={{ animationDelay: '1.2s' }}>
                {report.decorIcon2}
              </div>

              <div className="p-5 relative z-10">
                <div className="flex items-center mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${report.iconBg} flex items-center justify-center p-2 mr-4 shadow-lg`}>
                    {report.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg card-heading">{report.title}</h3>
                    <p className="text-sm card-body mt-0.5">{report.desc}</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-48 rounded-2xl overflow-hidden glass-tile p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.data}>
                      <defs>
                        {report.colors.map((color, ci) => (
                          <linearGradient key={ci} id={report.gradIds[ci]} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.7} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}`, color: tickColor, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                      {report.keys.map((key, ki) => (
                        <Area key={key} type="monotone" dataKey={key} stroke={report.colors[ki]} strokeWidth={2} fill={`url(#${report.gradIds[ki]})`} activeDot={{ r: 5, strokeWidth: 0 }} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend + CTA */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-3">
                    {report.keys.map((key, ki) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: report.colors[ki] }} />
                        <span className="text-xs card-label capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/report-details/${encodeURIComponent(report.key)}`} onClick={() => toast({ title: `${report.key} Details`, description: `Viewing ${report.key.toLowerCase()} report.` })}>
                    <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${report.btnClass} shadow-md hover:shadow-lg hover:scale-105 transition-all`}>
                      {t.viewDetails} <ArrowRight className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </PageShell>
  );
};

export default Reports;
