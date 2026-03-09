"use client";

import React from "react";
import { LeaveStrategy } from "./leave-calculator";

interface StrategyCardProps {
  readonly strategy: LeaveStrategy;
  readonly idx: number;
  readonly lang: "en" | "km";
  readonly onShare: (e: React.MouseEvent, cardId: string) => void;
  readonly onCopy: (dates: string[], id: string) => void;
  readonly isCopied: boolean;
  readonly formatDate: (
    dateStr: string,
    opts?: Intl.DateTimeFormatOptions,
  ) => string;
}

const getDestinationSuggestion = (month: number) => {
  const suggestions = [
    { dest: "Phuket", emo: "🏖️", country: "TH" }, // Jan
    { dest: "Taipei", emo: "🏮", country: "TW" }, // Feb
    { dest: "Kyoto", emo: "🌸", country: "JP" }, // Mar
    { dest: "Bali", emo: "🏝️", country: "ID" }, // Apr
    { dest: "Seoul", emo: "🍜", country: "KR" }, // May
    { dest: "Da Nang", emo: "🌊", country: "VN" }, // Jun
    { dest: "Singapore", emo: "🦁", country: "SG" }, // Jul
    { dest: "Kuala Lumpur", emo: "🏙️", country: "MY" }, // Aug
    { dest: "Hanoi", emo: "☕", country: "VN" }, // Sep
    { dest: "Tokyo", emo: "🍣", country: "JP" }, // Oct
    { dest: "Chiang Mai", emo: "🐘", country: "TH" }, // Nov
    { dest: "Hong Kong", emo: "🎆", country: "HK" }, // Dec
  ];
  return suggestions[month] || suggestions[0];
};

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

export default function StrategyCard({
  strategy,
  idx,
  lang,
  onShare,
  onCopy,
  isCopied,
  formatDate,
}: StrategyCardProps) {
  const pal = PALETTE[idx % PALETTE.length];
  const cardId = `${strategy.startDate.replaceAll(" ", "")}-${strategy.endDate.replaceAll(" ", "")}`;

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

  const destSuggestion = getDestinationSuggestion(
    new Date(strategy.startDate).getMonth(),
  );

  return (
    <div
      id={`strategy-card-${cardId}`}
      className="relative group transition-all duration-500 hover:-translate-y-2 active:scale-[0.98]"
    >
      <div
        className="relative w-full flex flex-col group shadow-lg transition-all duration-500"
        style={{ background: pal.bg }}
      >
        <div className="p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 border-4 border-white relative overflow-hidden">
          <span
            className="absolute top-4 right-8 sm:right-12 text-2xl animate-pulse"
            style={{ color: "#f9a8d4" }}
          >
            ✦
          </span>
          <span
            className="absolute bottom-24 left-4 sm:left-6 text-xl hidden sm:block"
            style={{ color: "#bfdbfe" }}
          >
            ✦
          </span>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <div
              className="w-20 h-20 flex flex-col items-center justify-center shadow-inner border-4 border-dashed group-hover:rotate-6 transition-transform duration-500"
              style={{
                backgroundColor: pal.border + "33",
                borderColor: pal.dark + "66",
              }}
            >
              <span
                className="text-[11px] font-black uppercase tracking-widest leading-none mb-1.5"
                style={{ color: pal.dark }}
              >
                {getMonthAbbr(strategy.startDate)}
              </span>
              <span
                className="text-3xl font-black"
                style={{ color: "#1f2937" }}
              >
                {getDayOfMonth(strategy.startDate)}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
              <h3
                className="text-lg sm:text-xl font-black leading-tight tracking-tight px-2 sm:px-0"
                style={{ color: "#1f2937" }}
              >
                {strategy.holidaysIncluded.join(" + ")}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: "#f9a8d4" }}
                />
                <p
                  className="text-[12px] font-black uppercase tracking-widest"
                  style={{ color: "#9ca3af" }}
                >
                  {lang === "km" ? "គម្រោងវិស្សមកាល ✿" : "Dream Strategy ✿"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-0 sm:px-2">
            <div
              className="w-full sm:flex-1 bg-white p-4 sm:p-5 flex flex-col items-center shadow-sm border-4 border-dashed group-hover:scale-105 transition-transform duration-500"
              style={{ borderColor: "#d1fae5" }}
            >
              <span
                className="text-[28px] font-black leading-none mb-1.5"
                style={{ color: "#10b981" }}
              >
                {strategy.leaveDaysCount}d
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-tighter"
                style={{ color: "#9ca3af" }}
              >
                Leaves Used
              </span>
            </div>
            <div
              className="text-xl sm:text-2xl font-black animate-bounce rotate-90 sm:rotate-0 my-1 sm:my-0"
              style={{ color: "#fbcfe8" }}
            >
              ➔
            </div>
            <div
              className="w-full sm:flex-1 p-4 sm:p-5 flex flex-col items-center shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundColor: "#ec4899" }}
            >
              <span className="text-[24px] sm:text-[28px] font-black text-white leading-none mb-1.5">
                {strategy.totalBreakDays}d
              </span>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">
                Total Off!
              </span>
            </div>
          </div>

          <div className="border-t-4 border-dashed border-gray-100/50 mx-4" />

          <div className="flex flex-wrap items-center justify-center gap-3">
            {strategy.leaveDates.map((date) => (
              <span
                key={date}
                className="px-4 py-2 text-[12px] font-black shadow-sm transition-transform hover:scale-110"
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#3b82f6",
                  border: "2px solid #dbeafe",
                }}
              >
                🍬{" "}
                {formatDate(date, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ))}
          </div>

          <p
            className="text-[14px] font-bold leading-relaxed text-center px-6 opacity-80 underline decoration-wavy underline-offset-4"
            style={{
              color: "#6b7280",
              textDecorationColor: "#fbcfe8",
            }}
          >
            {strategy.explanation}
          </p>

          <div
            className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 border-4 border-white shadow-inner"
            style={{
              backgroundColor: "rgba(249, 250, 251, 0.7)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 sm:px-2 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 bg-white flex items-center justify-center text-2xl shadow-sm border-2 group-hover:rotate-12 transition-transform"
                  style={{ borderColor: "#fdf2f8" }}
                >
                  {destSuggestion.emo}
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: "#f9a8d4" }}
                  >
                    Trending Spot
                  </span>
                  <span
                    className="text-[16px] font-black"
                    style={{ color: "#374151" }}
                  >
                    {destSuggestion.dest}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCopy(strategy.leaveDates, cardId)}
                className="px-6 py-2 bg-white text-[12px] font-black border-2 shadow-sm hover:bg-pink-50 transition-all active:scale-90"
                style={{
                  color: "#f472b6",
                  borderColor: "#fce7f3",
                }}
              >
                {isCopied ? "✨ Copied!" : "📋 Copy Dates"}
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 wanderlust-actions mt-2 sm:mt-0">
              <button
                type="button"
                onClick={(e) => onShare(e, cardId)}
                className="flex-1 flex items-center justify-center gap-2 text-white py-3 sm:py-4 text-[12px] sm:text-[13px] font-black transition-all shadow-md active:scale-95 cursor-pointer"
                style={{ backgroundColor: "#34d399" }}
              >
                💬 {lang === "km" ? "ចែករំលែក" : "Share"}
              </button>
              <a
                href={`https://www.skyscanner.net/transport/flights/pnh/any/${strategy.startDate.substring(2, 4)}${strategy.startDate.substring(5, 7)}${strategy.startDate.substring(8, 10)}/${strategy.endDate.substring(2, 4)}${strategy.endDate.substring(5, 7)}${strategy.endDate.substring(8, 10)}/?adultsv2=2&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 text-white py-4 text-[13px] font-black transition-all shadow-md active:scale-95 cursor-pointer"
                style={{ backgroundColor: "#38bdf8" }}
              >
                ✈️ {lang === "km" ? "ហោះហើរ" : "Flights"}
              </a>
            </div>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 text-5xl sm:text-6xl opacity-90 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000 select-none z-20">
          {pal.emoji}
        </div>
      </div>
    </div>
  );
}
