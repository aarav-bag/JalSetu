import { useTheme } from "@/context/ThemeContext";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${className}`}>
      {/* Background */}
      <div className="fixed inset-0 -z-10 page-bg transition-colors duration-500" />

      {/* Orbs — visible in both modes, different opacity */}
      <div className="orb -z-10 top-[-80px] left-[-60px] w-72 h-72 bg-blue-400 opacity-20 dark:opacity-25" />
      <div className="orb -z-10 top-[30%] right-[-80px] w-64 h-64 bg-cyan-300 opacity-15 dark:opacity-20" />
      <div className="orb -z-10 top-[55%] left-[-40px] w-56 h-56 bg-emerald-400 opacity-10 dark:opacity-15" />
      <div className="orb -z-10 bottom-[-60px] right-[20%] w-72 h-72 bg-indigo-400 opacity-15 dark:opacity-20" />
      <div className="orb -z-10 bottom-[25%] left-[30%] w-48 h-48 bg-purple-400 opacity-10 dark:opacity-15" />

      {children}
    </div>
  );
}
