"use client";

import React from "react";
import { HolidayEvent, toKhmerDigits } from "./calendar-data";

interface CalendarListProps {
  readonly displayEvents: HolidayEvent[];
  readonly lang: "en" | "km";
  readonly setSelectedEvent: (event: HolidayEvent) => void;
}

export default function CalendarList({
  displayEvents,
  lang,
  setSelectedEvent,
}: CalendarListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
      {Object.entries(
        displayEvents
          .slice()
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .reduce(
            (acc, event) => {
              const d = new Date(event.date);
              const monthKey = d.toLocaleDateString(
                lang === "km" ? "km-KH" : "en-US",
                { month: "long", year: "numeric" },
              );
              if (!acc[monthKey]) acc[monthKey] = [];
              acc[monthKey].push(event);
              return acc;
            },
            {} as Record<string, typeof displayEvents>,
          ),
      ).map(([month, events]) => (
        <div key={month} className="animate-fade-in relative">
          <div className="text-center md:text-left">
            <h2
              className="cute-month-header"
              style={{
                fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
              }}
            >
              {month} ✿
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {events.map((event) => {
              const evTitle =
                lang === "km" ? event.khmerTitle || event.title : event.title;
              const d = new Date(event.date);
              const monthShort = d.toLocaleDateString(
                lang === "km" ? "km-KH" : "en-US",
                { month: "short" },
              );
              const dayOfWeek = d.toLocaleDateString(
                lang === "km" ? "km-KH" : "en-US",
                { weekday: "short" },
              );
              const dayNum = d.getDate();
              const displayDay = lang === "km" ? toKhmerDigits(dayNum) : dayNum;

              return (
                <button
                  type="button"
                  key={`${event.date}-${event.title}`}
                  onClick={() => setSelectedEvent(event)}
                  className="cute-list-card animate-fade-in"
                  style={
                    {
                      "--bg-theme": `var(--cute-${event.theme})`,
                      "--shadow-theme": `var(--cute-${event.theme}-dark)`,
                    } as React.CSSProperties
                  }
                >
                  <div className="cute-list-date">
                    <span
                      className="month"
                      style={{
                        fontFamily:
                          lang === "km" ? "var(--font-khmer)" : "inherit",
                      }}
                    >
                      {monthShort}
                    </span>
                    <span className="day">{displayDay}</span>
                  </div>

                  <div className="flex-1 text-left line-clamp-2">
                    <h3
                      className="font-bold text-lg text-gray-800 leading-tight"
                      style={{
                        fontFamily:
                          lang === "km" ? "var(--font-khmer)" : "inherit",
                      }}
                    >
                      {evTitle}
                    </h3>
                    <p className="text-[11px] font-bold opacity-70 mt-1 uppercase tracking-wider flex items-center gap-1">
                      {event.country === "UN" ? "🌍" : "🇰🇭"}{" "}
                      {lang === "km" ? "ទិវាឈប់សម្រាក" : "Public Holiday"} •{" "}
                      {dayOfWeek}
                    </p>
                  </div>
                  <div className="text-4xl pr-2">{event.emoji}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
