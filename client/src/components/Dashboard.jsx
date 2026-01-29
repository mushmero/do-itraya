import React from "react";
import {
  BanknotesIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import AnimatedCounter from "./AnimatedCounter";
import MiniDonutChart from "./MiniDonutChart";
import TrendSparkline from "./TrendSparkline";
import YearComparisonChart from "./YearComparisonChart";

const Dashboard = ({ summary, selectedYear }) => {
  const { total_planned, total_distributed, balance, notes_breakdown } =
    summary;

  const progressPercentage =
    total_planned > 0 ? (total_distributed / total_planned) * 100 : 0;

  // Calculate trend (mock data - you can enhance this with historical data)
  const distributedTrend = total_distributed > 0 ? 12.5 : 0;
  const balanceTrend = balance > 0 ? -8.3 : 0;

  return (
    <div className="space-y-6">
      {/* Bento Grid - Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Main Card - Total Budget (Spans 2 columns on desktop) */}
        <div className="md:col-span-2 glass-premium rounded-3xl p-6 md:p-8 relative overflow-hidden group card-hover opacity-0 animate-fade-in-up">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gold-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-accent/30 to-gold-dark/20 border border-accent/30 shadow-glow-sm">
                  <BanknotesIcon
                    className="w-6 h-6 text-accent"
                    style={{ width: 24, height: 24 }}
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] dark:text-slate-400 light:text-slate-500 font-bold mb-1">
                    Total Budget
                  </p>
                  <p className="text-[10px] dark:text-slate-500 light:text-slate-400">
                    Festive Allocation {selectedYear}
                  </p>
                </div>
              </div>

              {/* Mini Donut Chart */}
              {total_planned > 0 && (
                <div
                  className="hidden md:block overflow-hidden"
                  style={{ width: 70, height: 70 }}
                >
                  <MiniDonutChart
                    distributed={total_distributed}
                    total={total_planned}
                    size={70}
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg dark:text-slate-400 light:text-slate-500 font-medium">
                  RM
                </span>
                <AnimatedCounter
                  value={total_planned || 0}
                  duration={1200}
                  className="text-5xl md:text-6xl font-bold text-gradient-gold font-mono"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {total_planned > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="dark:text-slate-400 light:text-slate-500">
                    Distribution Progress
                  </span>
                  <span className="text-accent font-bold tabular-nums">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2.5 dark:bg-secondary/80 light:bg-slate-200 rounded-full overflow-hidden border dark:border-white/5 light:border-slate-300 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-accent to-gold-dark transition-all duration-1000 ease-out shadow-lg shadow-accent/30 relative"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] dark:text-slate-500 light:text-slate-400">
                  <span>RM {total_distributed} distributed</span>
                  <span>RM {balance} remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Cards - Distributed & Balance */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
          {/* Distributed Card */}
          <div className="glass-premium rounded-3xl p-5 relative overflow-hidden group card-hover opacity-0 animate-fade-in-up animation-delay-100">
            <div className="absolute inset-0 bg-emerald-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-success/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                  <UserGroupIcon
                    className="w-5 h-5 text-emerald-400"
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <ArrowTrendingUpIcon
                      className="w-3 h-3"
                      style={{ width: 12, height: 12 }}
                    />
                    <span>{distributedTrend}%</span>
                  </div>
                  <div
                    className="overflow-hidden"
                    style={{ width: 50, height: 20 }}
                  >
                    <TrendSparkline trend="up" width={50} height={20} />
                  </div>
                </div>
              </div>

              <p className="text-[10px] uppercase tracking-widest dark:text-slate-400 light:text-slate-500 font-bold mb-2">
                Distributed
              </p>

              <div className="flex items-baseline gap-1">
                <span className="text-xs dark:text-slate-400 light:text-slate-500">
                  RM
                </span>
                <AnimatedCounter
                  value={total_distributed || 0}
                  duration={1000}
                  className="text-3xl font-bold text-emerald-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="glass-premium rounded-3xl p-5 relative overflow-hidden group card-hover opacity-0 animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-blue-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-info/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                  <ScaleIcon
                    className="w-5 h-5 text-blue-400"
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={clsx(
                      "flex items-center gap-1 text-[10px] font-bold",
                      balanceTrend >= 0
                        ? "text-emerald-400"
                        : "text-orange-400",
                    )}
                  >
                    {balanceTrend >= 0 ? (
                      <ArrowTrendingUpIcon
                        className="w-3 h-3"
                        style={{ width: 12, height: 12 }}
                      />
                    ) : (
                      <ArrowTrendingDownIcon
                        className="w-3 h-3"
                        style={{ width: 12, height: 12 }}
                      />
                    )}
                    <span>{Math.abs(balanceTrend)}%</span>
                  </div>
                  <div
                    className="overflow-hidden"
                    style={{ width: 50, height: 20 }}
                  >
                    <TrendSparkline
                      trend={balanceTrend >= 0 ? "up" : "down"}
                      width={50}
                      height={20}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] uppercase tracking-widest dark:text-slate-400 light:text-slate-500 font-bold mb-2">
                Balance
              </p>

              <div className="flex items-baseline gap-1">
                <span className="text-xs dark:text-slate-400 light:text-slate-500">
                  RM
                </span>
                <AnimatedCounter
                  value={balance || 0}
                  duration={1000}
                  className="text-3xl font-bold text-blue-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Notes Breakdown */}
      {notes_breakdown && notes_breakdown.length > 0 && (
        <div className="glass-premium rounded-3xl p-6 md:p-7 relative overflow-hidden group opacity-0 animate-fade-in-up animation-delay-300">
          <div className="absolute inset-0 gradient-mesh-bg opacity-30" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-gold-dark/10 border border-accent/30">
                  <BanknotesIcon
                    className="w-5 h-5 text-accent"
                    style={{ width: 20, height: 20 }}
                  />
                </div>
                <div>
                  <p className="text-sm dark:text-slate-200 light:text-slate-700 font-bold">
                    Cash Notes Breakdown
                  </p>
                  <p className="text-[10px] dark:text-slate-500 light:text-slate-400 mt-0.5">
                    Required denominations
                  </p>
                </div>
              </div>

              {/* Summary Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-secondary/50 light:bg-slate-100 border dark:border-white/10 light:border-slate-200">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs dark:text-slate-300 light:text-slate-600">
                  {
                    notes_breakdown.filter((n) => n.remaining_count === 0)
                      .length
                  }{" "}
                  / {notes_breakdown.length} Complete
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
              {notes_breakdown.map((note) => {
                const isComplete = note.remaining_count === 0;
                const completionPercentage =
                  note.total_count > 0
                    ? ((note.total_count - note.remaining_count) /
                        note.total_count) *
                      100
                    : 0;

                return (
                  <div
                    key={note.cash_note}
                    className={clsx(
                      "relative rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 group/card",
                      "border-2 shadow-lg backdrop-blur-sm",
                      isComplete
                        ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400/70 shadow-emerald-500/20"
                        : "bg-gradient-to-br from-accent/15 to-amber-600/10 border-accent/40 hover:border-accent/60 shadow-accent/20",
                    )}
                  >
                    {/* Completion indicator */}
                    {isComplete && (
                      <div className="absolute -top-1.5 -right-1.5 z-10">
                        <div className="bg-emerald-500 rounded-full p-1 shadow-lg shadow-emerald-500/50">
                          <CheckCircleIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Note denomination */}
                    <div
                      className={clsx(
                        "text-base md:text-lg font-bold mb-3",
                        isComplete ? "text-emerald-400" : "text-accent",
                      )}
                    >
                      RM {note.cash_note}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="h-1.5 dark:bg-secondary/60 light:bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full transition-all duration-700 rounded-full",
                            isComplete
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              : "bg-gradient-to-r from-accent to-gold-dark",
                          )}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="dark:text-slate-500 light:text-slate-400">
                          Need:
                        </span>
                        <span className="dark:text-slate-200 light:text-slate-700 font-bold tabular-nums">
                          {note.total_count}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="dark:text-slate-500 light:text-slate-400">
                          Left:
                        </span>
                        <span
                          className={clsx(
                            "font-bold tabular-nums",
                            isComplete ? "text-emerald-400" : "text-orange-400",
                          )}
                        >
                          {note.remaining_count}
                        </span>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Yearly Comparison Chart */}
      <YearComparisonChart />
    </div>
  );
};

export default Dashboard;
