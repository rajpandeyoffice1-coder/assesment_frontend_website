import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  className?: string;
}

const gradientClasses = {
  blue: 'bg-gradient-stat-blue',
  green: 'bg-gradient-stat-green',
  purple: 'bg-gradient-stat-purple',
  orange: 'bg-gradient-stat-orange',
  pink: 'bg-gradient-stat-pink',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, gradient, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover-lift",
        gradientClasses[gradient],
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 font-display text-4xl font-bold">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-white/70">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-emerald-200" : "text-red-200"
                )}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-white/60">vs last week</span>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
