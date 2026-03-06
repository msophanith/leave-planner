import React, { useMemo, useState } from "react";
import { calculateLeaveStrategies } from "./leave-calculator";
import { HolidayEvent } from "./calendar-data";

interface LeavePlannerListProps {
  readonly lang: "en" | "km";
  readonly year: number;
  readonly events: HolidayEvent[];
  readonly onClose: () => void;
}

const PALETTE = [
  {
    bg: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
    dark: "#166534",
    border: "#bbf7d0",
    shadow: "#bcf0da",
    emoji: "🎉",
  },
  {
    bg: "linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)",
    dark: "#854d0e",
    border: "#fef08a",
    shadow: "#f1f4c7",
    emoji: "✌️",
  },
  {
    bg: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
    dark: "#9d174d",
    border: "#fbcfe8",
    shadow: "#f8d7e8",
    emoji: "🌸",
  },
  {
    bg: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
    dark: "#92400e",
    border: "#fde68a",
    shadow: "#f7eab7",
    emoji: "🌷",
  },
  {
    bg: "linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)",
    dark: "#9a3412",
    border: "#fed7aa",
    shadow: "#fbdcc1",
    emoji: "🍑",
  },
  {
    bg: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
    dark: "#6b21a8",
    border: "#e9d5ff",
    shadow: "#e2d1f7",
    emoji: "🔮",
  },
];

export default function LeavePlannerList({
  lang,
  year,
  events,
  onClose,
}: LeavePlannerListProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const strategies = useMemo(
    () => calculateLeaveStrategies(year, events),
    [year, events],
  );

  const groupedStrategies = useMemo(() => {
    const groups: Record<string, typeof strategies> = {};
    strategies.forEach((s) => {
      const date = new Date(s.startDate);
      const monthYear = date.toLocaleDateString(
        lang === "km" ? "km-KH" : "en-US",
        {
          month: "long",
          year: "numeric",
        },
      );
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(s);
    });
    return groups;
  }, [strategies, lang]);

  const summary = useMemo(() => {
    const totalLeaveUsed = strategies.reduce(
      (acc, s) => acc + s.leaveDaysCount,
      0,
    );
    const totalDaysOff = strategies.reduce(
      (acc, s) => acc + s.totalBreakDays,
      0,
    );
    const efficiency =
      totalLeaveUsed > 0 ? (totalDaysOff / totalLeaveUsed).toFixed(1) : "0";
    return { totalLeaveUsed, totalDaysOff, efficiency };
  }, [strategies]);

  const handleCopy = (dates: string[], id: string) => {
    const text = dates
      .map((d) =>
        new Date(d).toLocaleDateString(lang === "km" ? "km-KH" : "en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      )
      .join(", ");
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getDayOfWeek = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === "km" ? "km-KH" : "en-US",
      {
        weekday: "short",
      },
    );
  };

  const getMonthAbbr = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleDateString(lang === "km" ? "km-KH" : "en-US", {
        month: "short",
      })
      .toUpperCase();
  };

  const getDayOfMonth = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  const formatDate = (dateStr: string, opts?: Intl.DateTimeFormatOptions) =>
    new Date(dateStr).toLocaleDateString(
      lang === "km" ? "km-KH" : "en-US",
      opts ?? { month: "short", day: "numeric" },
    );

  return (
    <div className="absolute inset-0 z-200 flex items-center justify-center p-4 sm:p-8 lg:p-12" style={{ padding: 16 }}>
      {/* Backdrop: Native button for accessibility */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm cursor-default border-none outline-none"
        onClick={onClose}
        aria-label={lang === "km" ? "បិទ" : "Close"}
      />

      <div className="relative w-full max-w-7xl max-h-[85vh] flex flex-col bg-white overflow-hidden font-nunito rounded-[40px] shadow-2xl" style={{ margin: '0 16px' }}>
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-8 sm:px-12 lg:px-16 py-6 border-b border-gray-100 shrink-0" style={{ padding: 16 }}>
          <div className="flex items-center gap-4">
            <span className="text-3xl">🤖</span>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">
              {lang === "km" ? "ជំនួយការសម្រាកប្រចាំឆ្នាំ" : "AI Leave Assistant"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors bg-red-400 text-white"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-12 lg:px-16 py-8 space-y-12 custom-scrollbar" style={{ padding: 16 }}>
          {Object.entries(groupedStrategies).map(
            ([monthYear, monthStrategies]) => (
              <div key={monthYear} className="space-y-6" >
                {/* Month Header - Pill style */}
                <div className="inline-flex items-center gap-2 px-5 py-2 border-2 border-dashed border-pink-100 rounded-full bg-[#fff9fb]">
                  <span className="text-sm font-black text-gray-700">
                    {monthYear} ✿
                  </span>
                </div>

                {/* Strategy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-4">
                  {monthStrategies.map((strategy, idx) => {
                    const pal = PALETTE[idx % PALETTE.length];
                    const cardId = `${strategy.startDate}-${strategy.endDate}`;
                    const isCopied = copied === cardId;

                    return (
                      <div
                        key={cardId}
                        style={{ padding: '16px 0' }}
                        className='relative group transition-all duration-500 hover:-translate-y-1.5 active:scale-[0.98]'
                      >
                        {/* Perspective Shadow */}
                        <div
                          className='absolute inset-x-2 -bottom-2 h-10 rounded-[40px] opacity-40 blur-xl transition-all group-hover:blur-2xl'
                          style={{ backgroundColor: pal.shadow }}
                        />

                        {/* Main Card */}
                        <button
                          type='button'
                          className='relative w-full p-4 rounded-[40px] flex items-center gap-6 cursor-pointer border-2 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none focus-visible:ring-4 focus-visible:ring-blue-400 group-active:scale-95 transition-all duration-300 text-left'
                          style={{
                            background: pal.bg,
                            borderColor: pal.border,
                          }}
                          onClick={() =>
                            handleCopy(strategy.leaveDates, cardId)
                          }
                        >
                          {/* Inner Shine Effect */}
                          <div
                            className='absolute inset-0 bg-white/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700'
                            style={{
                              background:
                                'linear-gradient(to bottom right, rgba(255,255,255,0.6) 0%, transparent 60%)',
                            }}
                          />

                          {/* Left Date Pill */}
                          <div
                            style={{ padding: '16px 8px', marginLeft: 16 }}
                            className='bg-white rounded-3xl flex flex-col items-center justify-center min-w-18 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-50 z-10'
                          >
                            <span className='text-[11px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1.5'>
                              {getMonthAbbr(strategy.startDate)}
                            </span>
                            <span className='text-3xl font-black text-gray-800 leading-none'>
                              {getDayOfMonth(strategy.startDate)}
                            </span>
                          </div>

                          {/* Info Section */}
                          <div
                            className='flex-1 min-w-0 z-10'
                            style={{ padding: 8 }}
                          >
                            <h3
                              className='text-[17px] font-black text-gray-800 leading-tight truncate mb-1.5 px-0.5'
                              style={{ letterSpacing: '-0.01em' }}
                            >
                              {strategy.holidaysIncluded.join(' + ')}
                            </h3>

                            {/* Specific Leave Dates Section */}
                            <div className='flex flex-wrap items-center gap-2 mb-2'>
                              <span className='text-[10px] font-black text-red-500 uppercase tracking-widest'>
                                Apply AL:
                              </span>
                              {strategy.leaveDates.map((date) => (
                                <span
                                  style={{ padding: 4 }}
                                  key={date}
                                  className='px-2 py-0.5 rounded-md bg-white/60 text-[10px] font-black text-gray-700 border border-white/40 shadow-sm'
                                >
                                  {formatDate(date, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              ))}
                            </div>

                            <p className='text-[11px] text-gray-500 font-medium mb-3 px-0.5 opacity-80 line-clamp-2'>
                              {strategy.explanation}
                            </p>

                            <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                              <div className='flex items-center gap-1 opacity-70'>
                                <span className='text-xs'>🌏</span>
                                <p className='text-[11px] font-bold text-gray-500 uppercase tracking-tight'>
                                  {lang === 'km'
                                    ? 'ថ្ងៃឈប់សម្រាក'
                                    : 'Public Holiday'}{' '}
                                  • {getDayOfWeek(strategy.startDate)}
                                </p>
                              </div>
                              <div className='flex items-center gap-2'>
                                {/* Better Badges */}
                                <div
                                  style={{ padding: 4 }}
                                  className='flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm'
                                >
                                  <span className='text-[11px] font-black text-blue-600 leading-none'>
                                    {strategy.leaveDaysCount}d
                                  </span>
                                  <span className='text-[9px] font-bold text-gray-400 uppercase tracking-tighter'>
                                    Leave
                                  </span>
                                </div>
                                <div
                                  style={{ padding: 4 }}
                                  className='flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/5 border border-black/5 shadow-inner'
                                >
                                  <span className='text-[11px] font-black text-gray-800 leading-none'>
                                    {strategy.totalBreakDays}d
                                  </span>
                                  <span className='text-[9px] font-bold text-gray-400 uppercase tracking-tighter'>
                                    Off
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Emoji */}
                          <div className='text-4xl pr-2 filter transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 z-10 drop-shadow-sm'>
                            {pal.emoji}
                          </div>

                          {/* Copy Hint */}
                          {isCopied && (
                            <div className='absolute inset-0 bg-green-500/90 backdrop-blur-sm rounded-[40px] flex items-center justify-center animate-fade-in z-20'>
                              <div className='flex items-center gap-2'>
                                <span className='text-xl'>✅</span>
                                <span className='text-white font-black text-sm tracking-widest uppercase'>
                                  {lang === 'km' ? 'ចម្លងរួច!' : 'Copied!'}
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )}

          {/* --- Minimal Summary Dashboard --- */}
          <div>
            <div className="bg-gray-50 rounded-[40px] p-4 border border-gray-100" style={{ padding: 16 }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-black text-gray-800 mb-1">
                    Strategy Overview
                  </h2>
                  <p className="text-sm font-bold text-gray-400">
                    Your optimal 18-day holiday roadmap
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                  {[
                    {
                      label: "Used",
                      val: `${summary.totalLeaveUsed}d`,
                      color: "text-red-500",
                    },
                    {
                      label: "Off",
                      val: `${summary.totalDaysOff}d`,
                      color: "text-green-600",
                    },
                    {
                      label: "Efficiency",
                      val: `${summary.efficiency}x`,
                      color: "text-blue-600",
                    },
                    {
                      label: "Gain",
                      val: `+${summary.totalDaysOff - summary.totalLeaveUsed}d`,
                      color: "text-orange-500",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{padding: "16px 8px"}}
                      className="bg-white p-4 rounded-3xl text-center border border-gray-100 shadow-sm"
                    >
                      <div className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">
                        {m.label}
                      </div>
                      <div className={`text-xl font-black ${m.color}`}>
                        {m.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
