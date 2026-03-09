"use client";

import React, { useEffect, useState, useMemo } from "react";
import { HolidayEvent } from "./calendar-data";

const TIMEZONES: Record<string, string> = {
  KH: "Asia/Phnom_Penh",
  SG: "Asia/Singapore",
  JP: "Asia/Tokyo",
  TH: "Asia/Bangkok",
  MY: "Asia/Kuala_Lumpur",
  VN: "Asia/Ho_Chi_Minh",
  KR: "Asia/Seoul",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  GB: "Europe/London",
  US: "America/New_York",
};

export default function NextHolidayCountdown({
  events,
  lang,
  country,
}: {
  readonly events: HolidayEvent[];
  readonly lang: "en" | "km";
  readonly country: string;
}) {
  const timezone = TIMEZONES[country] || "UTC";

  // Helper to get a Date object representing the time in the target timezone
  const getTZNow = React.useCallback(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const map: Record<string, number> = {};
    parts.forEach((p) => {
      if (p.type !== "literal") map[p.type] = Number.parseInt(p.value, 10);
    });
    // Create a NEW date object that represents the numbers in that timezone
    return new Date(
      map.year,
      map.month - 1,
      map.day,
      map.hour,
      map.minute,
      map.second,
    );
  }, [timezone]);

  const { nextHoliday, followingHolidays } = useMemo(() => {
    const now = getTZNow();
    now.setHours(0, 0, 0, 0);

    const upcoming = [...events]
      .filter((e) => {
        const d = new Date(e.date);
        return d.getTime() >= now.getTime();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      nextHoliday: upcoming.length > 0 ? upcoming[0] : null,
      followingHolidays: upcoming.slice(1, 4), // Get next 3 holidays
    };
  }, [events, getTZNow]);

  const [currentTime, setCurrentTime] = useState(getTZNow());
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!nextHoliday) {
      return;
    }
    const targetDate = new Date(nextHoliday.date);
    targetDate.setHours(0, 0, 0, 0);

    const updateTimer = () => {
      const now = getTZNow();
      setCurrentTime(now);
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [nextHoliday, getTZNow]);

  if (!nextHoliday || !timeLeft) return null;

  const title =
    lang === "km"
      ? nextHoliday.khmerTitle || nextHoliday.title
      : nextHoliday.title;

  // Calculate progress percentage (simple 30-day window for visual)
  const holidayDate = new Date(nextHoliday.date).getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const progress = Math.min(
    100,
    Math.max(
      0,
      100 - ((holidayDate - currentTime.getTime()) / thirtyDaysMs) * 100,
    ),
  );

  return (
    <div
      className="w-full h-full rounded-[48px] p-6 sm:p-8 flex flex-col items-stretch justify-start gap-4 shadow-[0_25px_60px_-15px_rgba(255,182,193,0.35)] border-[5px] border-white relative overflow-hidden group/main"
      style={{
        background: "linear-gradient(165deg, #ffffff 0%, #fff8fa 100%)",
      }}
    >
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-8 pt-4">
        {/* Hero Section: The Big Countdown */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            {/* Progress Ring Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-[8px] border-pink-50 opacity-50" />
              <svg className="absolute w-36 h-36 -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="68"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - progress / 100)}
                  className="text-pink-400 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="relative w-36 h-36 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-pink-50 group-hover/main:scale-105 transition-transform duration-500">
              <span className="text-7xl drop-shadow-sm select-none">
                {nextHoliday.emoji}
              </span>
            </div>
          </div>

          <div className="text-center group-hover/main:-translate-y-1 transition-transform duration-500">
            <div className="inline-block px-4 py-1.5 bg-pink-100/50 text-pink-600 rounded-full mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                {lang === "km" ? "ថ្ងៃឈប់សម្រាកបន្ទាប់" : "Next Celebration"}
              </p>
            </div>
            <h3
              className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight mb-3 tracking-tighter px-4"
              style={{
                fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
              }}
            >
              {title}
            </h3>
            <p className="text-sm font-bold text-gray-400 flex items-center justify-center gap-2">
              <span className="text-pink-300">✦</span>
              {new Date(nextHoliday.date).toLocaleDateString(
                lang === "km" ? "km-KH" : "en-US",
                { weekday: "long", month: "long", day: "numeric" },
              )}
              <span className="text-pink-300">✦</span>
            </p>
          </div>
        </div>

        {/* Precision Countdown Cards */}
        <div className="grid grid-cols-4 gap-3 w-full z-10 px-2">
          {[
            { label: "Days", value: timeLeft.days, color: "bg-pink-500" },
            { label: "Hrs", value: timeLeft.hours, color: "bg-pink-400" },
            { label: "Min", value: timeLeft.minutes, color: "bg-pink-300" },
            { label: "Sec", value: timeLeft.seconds, color: "bg-pink-200" },
          ].map((part) => (
            <div
              key={part.label}
              className="relative overflow-hidden flex flex-col items-center bg-white rounded-[32px] pt-6 pb-4 shadow-sm border border-pink-50 group/card transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1.5 ${part.color} opacity-30`}
              />
              <span className="text-2xl font-black text-gray-800 leading-none font-mono mb-2">
                {part.value.toString().padStart(2, "0")}
              </span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {part.label}
              </span>
            </div>
          ))}
        </div>

        {/* Roadmap: Following Holidays */}
        {followingHolidays.length > 0 && (
          <div className="mt-4 pt-10 border-t-2 border-dashed border-pink-100/40 relative">
            <div className="flex items-center justify-between mb-6 px-2">
              <p className="text-[11px] font-black text-pink-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="p-1.5 bg-pink-100 rounded-xl text-sm">📅</span>
                {lang === "km"
                  ? "ថ្ងៃឈប់សម្រាកបន្តបន្ទាប់"
                  : "Upcoming Roadmap"}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {followingHolidays.map((holiday, idx) => (
                <div
                  key={`${holiday.title}-${idx}`}
                  className="flex items-center gap-4 group/item relative p-3 rounded-2xl hover:bg-white/80 transition-all duration-300 border border-transparent hover:border-pink-50 hover:shadow-sm"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-50 text-2xl group-hover/item:scale-110 group-hover/item:rotate-6 transition-all">
                    {holiday.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-800 truncate leading-none mb-2">
                      {lang === "km"
                        ? holiday.khmerTitle || holiday.title
                        : holiday.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {new Date(holiday.date).toLocaleDateString(
                          lang === "km" ? "km-KH" : "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                      <span className="text-[9px] font-black text-pink-500/80">
                        {Math.ceil(
                          (new Date(holiday.date).getTime() -
                            currentTime.getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        {lang === "km" ? "ថ្ងៃរង់ចាំ" : "days out"}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-pink-50 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <span className="text-pink-400 text-xs">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refined Footer: Floating Day, Date & Time */}
      <div className="pt-6 mt-2 border-t border-pink-50 flex flex-col items-center justify-center z-20 gap-2 shrink-0">
        <div className="flex items-center group-hover/main:scale-105 transition-all duration-500">
          <div className="flex flex-col items-center px-4 text-center">
            <span className="text-[20px] font-black text-gray-800 tracking-tight leading-none mb-2">
              {currentTime.toLocaleDateString(
                lang === "km" ? "km-KH" : "en-US",
                {
                  weekday: "long",
                },
              )}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-pink-500/60 uppercase tracking-widest mr-1">
                  {country} TIME
                </span>
                <span className="text-[13px] font-bold text-gray-400 font-mono tracking-tight">
                  {currentTime.toLocaleDateString(
                    lang === "km" ? "km-KH" : "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />
                <span className="text-[14px] font-black text-pink-600 font-mono tracking-tight">
                  {currentTime.toLocaleTimeString(
                    lang === "km" ? "km-KH" : "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    },
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 opacity-60">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-1">
                  UTC TIME
                </span>
                <span className="text-[12px] font-black text-gray-500 font-mono tracking-tight">
                  {new Date().toLocaleTimeString("en-US", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-pink-200/20 blur-[60px] rounded-full pointer-events-none group-hover/main:bg-pink-200/30 transition-colors duration-1000" />
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-pink-50 blur-[50px] rounded-full pointer-events-none" />
    </div>
  );
}
