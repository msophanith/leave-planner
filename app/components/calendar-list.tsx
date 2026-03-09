"use client";

import React from "react";
import { HolidayEvent, toKhmerDigits } from "./calendar-data";
import ReactCountryFlag from "react-country-flag";

interface CalendarListProps {
  readonly displayEvents: HolidayEvent[];
  readonly lang: "en" | "km";
  readonly setSelectedEvent: (event: HolidayEvent) => void;
}

/** Returns a badge color class based on the holiday type string */
function getTypeBadgeStyle(primaryType = "Public Holiday"): {
  bg: string;
  color: string;
} {
  const t = primaryType.toLowerCase();
  if (t.includes("national") || t.includes("public"))
    return { bg: "#ffd6e0", color: "#c0304f" };
  if (t.includes("observance")) return { bg: "#cce3de", color: "#4a7c6b" };
  if (t.includes("optional") || t.includes("restricted"))
    return { bg: "#fefae0", color: "#a07830" };
  return { bg: "#e0c3fc", color: "#6b21a8" };
}

export default function CalendarList({
  displayEvents,
  lang,
  setSelectedEvent,
}: CalendarListProps) {
  const sorted = [...displayEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const grouped = sorted.reduce(
    (acc, event) => {
      const monthKey = new Date(event.date).toLocaleDateString(
        lang === "km" ? "km-KH" : "en-US",
        { month: "long", year: "numeric" },
      );
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(event);
      return acc;
    },
    {} as Record<string, HolidayEvent[]>,
  );

  return (
    <div className="px-4 py-4 space-y-8">
      {Object.entries(grouped).map(([month, events]) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                { weekday: "long" },
              );
              const dayNum = d.getDate();
              const displayDay = lang === "km" ? toKhmerDigits(dayNum) : dayNum;
              const badge = getTypeBadgeStyle(event.primaryType);

              let locDisplay = event.locations ?? "Cambodia";
              if (locDisplay === "All") {
                locDisplay = lang === "km" ? "ទូទាំងប្រទេស" : "Nationwide";
              }

              return (
                <button
                  type="button"
                  key={`${event.date}-${event.title}`}
                  onClick={() => setSelectedEvent(event)}
                  className="cute-list-card-v2 animate-fade-in"
                  style={
                    {
                      "--bg-theme": `var(--cute-${event.theme})`,
                      "--shadow-theme": `var(--cute-${event.theme}-dark)`,
                    } as React.CSSProperties
                  }
                >
                  {/* Left: Date column */}
                  <div className="cute-list-date-v2">
                    <span
                      className="list-date-month"
                      style={{
                        fontFamily:
                          lang === "km" ? "var(--font-khmer)" : "inherit",
                      }}
                    >
                      {monthShort}
                    </span>
                    <span className="list-date-day">{displayDay}</span>
                    <span className="list-date-weekday">
                      {dayOfWeek.slice(0, 3)}
                    </span>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 text-left min-w-0 py-1">
                    {/* Type badge */}
                    <span
                      className="cute-list-type-badge"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {event.primaryType ?? "Public Holiday"}
                    </span>

                    {/* Title */}
                    <h3
                      className="cute-list-title"
                      style={{
                        fontFamily:
                          lang === "km" ? "var(--font-khmer)" : "inherit",
                      }}
                    >
                      {evTitle}
                    </h3>

                    {/* Description — truncated to 2 lines */}
                    {event.description && (
                      <p className="cute-list-desc">{event.description}</p>
                    )}

                    {/* Footer meta row */}
                    <div className="cute-list-meta">
                      <span>
                        <ReactCountryFlag
                          countryCode={
                            event.country === "UN" || event.country.length > 2
                              ? "KH"
                              : event.country
                          }
                          svg
                          style={{
                            width: "1.2em",
                            height: "0.9em",
                            borderRadius: "2px",
                            marginRight: "4px",
                          }}
                        />
                        {locDisplay}
                      </span>
                      {event.types && event.types.length > 1 && (
                        <span className="cute-list-extra-type">
                          +{event.types.length - 1} type
                          {event.types.length > 2 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Emoji */}
                  <div className="text-3xl pr-1 flex-shrink-0 self-center">
                    {event.emoji}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
