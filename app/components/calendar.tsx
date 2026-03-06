"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ReactCountryFlag from "react-country-flag";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import Image from "next/image";

import {
  HolidayEvent,
  KHMER_TRANSLATIONS,
  BASE_PLACEHOLDERS,
  getEmojiForHoliday,
  getThemeForHoliday,
} from "./calendar-data";
import CalendarList from "./calendar-list";
import LeavePlannerList from "./leave-planner-list";

// --- Sub-components ---

interface ModalProps {
  event: HolidayEvent;
  onClose: () => void;
  lang: "en" | "km";
}

const HolidayModal = ({ event, onClose, lang }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    globalThis.addEventListener("keydown", handleEsc);
    return () => globalThis.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 2000,
    };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const title = lang === "km" ? event.khmerTitle || event.title : event.title;

  return (
    <div className="cute-modal-overlay">
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-transparent border-none cursor-default outline-none"
        onClick={onClose}
        aria-label={lang === "km" ? "បិទ" : "Close"}
      />
      <div className="cute-modal" role="dialog" aria-modal="true" tabIndex={-1}>
        <button
          className="cute-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✿
        </button>
        <div className="cute-modal-header">
          <div className="cute-modal-emoji">{event.emoji}</div>
        </div>
        <div className="cute-modal-body">
          <ReactCountryFlag
            countryCode={
              event.country === "UN" || event.country.length > 2
                ? "UN"
                : event.country
            }
            svg
            style={{
              width: 48,
              height: 48,
            }}
          />
          <h3
            className="cute-modal-title"
            style={{
              fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
            }}
          >
            {title}
          </h3>
          <p className="cute-modal-date">
            {new Date(event.date).toLocaleDateString(
              lang === "km" ? "km-KH" : "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
          <div className="cute-modal-tips">
            <span className="text-xl">✨</span>
            <p className="text-sm font-bold text-gray-500 italic">
              {lang === "km"
                ? "សូមរីករាយជាមួយថ្ងៃវិស្សមកាលរបស់អ្នក!"
                : "Enjoy your special day!"}
            </p>
          </div>
          <button className="cute-modal-btn mt-6" onClick={onClose}>
            {lang === "km" ? "រួចរាល់" : "Yay!"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Calendar() {
  const [apiEvents, setApiEvents] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HolidayEvent | null>(null);
  const [lang, setLang] = useState<"en" | "km">("en");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showPlanner, setShowPlanner] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<FullCalendar>(null);
  const isInitialMount = useRef(true);

  const fetchHolidays = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_CALENDARIFIC_API_KEY;
    if (!apiKey || apiKey === "your_actual_api_key_here") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=KH&year=${selectedYear}`,
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.meta?.error_detail || `Status ${response.status}`,
        );
      }
      const json = await response.json();
      const holidays = json.response?.holidays || [];
      const formatted: HolidayEvent[] = holidays.map(
        (h: {
          name: string;
          date: { iso: string };
          country: { id: string };
        }) => {
          const dateStr = h.date?.iso || "";
          const month = new Date(dateStr).getMonth();
          return {
            title: h.name,
            khmerTitle: KHMER_TRANSLATIONS[h.name] || h.name,
            date: dateStr.split("T")[0],
            country: h.country?.id?.toUpperCase() || "KH",
            theme: getThemeForHoliday(h.name, month),
            emoji: getEmojiForHoliday(h.name, month),
          };
        },
      );
      setApiEvents(formatted);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect";
      setError(`Sync Error: ${message}. Using offline calendar.`);
      setApiEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  useEffect(() => {
    // Navigate calendar to the start of the selected year
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        // On initial load, FullCalendar naturally defaults to the current month/date
      } else {
        // Defer to avoid flushSync warning during render
        requestAnimationFrame(() => {
          calendarApi.gotoDate(`${selectedYear}-01-01`);
        });
      }
    }
  }, [selectedYear]);

  useEffect(() => {
    const month = new Date().getMonth();
    const colors: Record<number, string> = {
      0: "#f0f7ff",
      1: "#fff0f3",
      2: "#f3fff0",
      3: "#fffbf0",
      4: "#f0fff9",
      5: "#fff5f0",
      6: "#f0fbff",
      7: "#f0fff4",
      8: "#fef0ff",
      9: "#fff9f0",
      10: "#f0f8ff",
      11: "#fff0f0",
    };
    document.documentElement.style.setProperty(
      "--bg-color",
      colors[month] || "#fffaf0",
    );
  }, []);

  const defaultEvents = useMemo(
    () =>
      BASE_PLACEHOLDERS.map((e) => ({
        ...e,
        date: `${selectedYear}-${e.monthDay}`,
      })),
    [selectedYear],
  );

  const displayEvents = useMemo(() => {
    const merged: HolidayEvent[] = [...defaultEvents];
    apiEvents.forEach((e) => {
      if (!merged.some((m) => m.date === e.date)) {
        merged.push(e);
      }
    });
    return merged;
  }, [apiEvents, defaultEvents]);

  const holidayDates = useMemo(
    () => new Set(displayEvents.map((e) => e.date)),
    [displayEvents],
  );

  const renderEventContent = useCallback(
    (info: {
      event: {
        extendedProps: { theme: string; emoji: string; khmerTitle?: string };
        title: string;
      };
    }) => {
      const theme = info.event.extendedProps.theme || "blue";
      const title =
        lang === "km"
          ? info.event.extendedProps.khmerTitle || info.event.title
          : info.event.title;
      return (
        <div className={`cute-event cute-theme-${theme} animate-fade-in`}>
          <span className="cute-event-emoji">
            {info.event.extendedProps.emoji}
          </span>
          <span
            className="cute-event-label"
            style={{
              fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
            }}
          >
            {title}
          </span>
        </div>
      );
    },
    [lang],
  );

  return (
    <div className="cute-page-container">
      <header className="cute-header glass-card p-6 mb-6 rounded-md animate-slide-down">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h1 className="cute-title">Holidays Buddy ✿</h1>
            <p className="cute-subtitle">
              {lang === "km"
                ? "ការណែនាំដ៏គួរឱ្យស្រលាញ់សម្រាប់ថ្ងៃឈប់សម្រាករបស់អ្នក!"
                : "A cute guide to your days off! ✨"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mt-4 md:mt-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="cute-year-select"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setViewMode((v) => (v === "calendar" ? "list" : "calendar"))
              }
              className="cute-lang-toggle"
            >
              {viewMode === "calendar" ? "📋 List of Holidays" : "📅 Calendar"}
            </button>
            <button
              onClick={() => setShowPlanner(!showPlanner)}
              className="cute-lang-toggle bg-[#fff0f3] text-pink-600 border-pink-400"
            >
              {lang === "km" ? "✈️ កាលវិភាគ" : "✈️ AI Leave Planner"}
            </button>
            <button
              onClick={() => setLang((l) => (l === "en" ? "km" : "en"))}
              className="cute-lang-toggle"
            >
              {lang === "en" ? "🇰🇭 Khmer" : "🇺🇸 English"}
            </button>
          </div>
        </div>
      </header>

      <div className="cute-calendar-wrapper">
        <div className="calendar-decorations">
          <span className="blob blob-1"></span>
          <span className="blob blob-2"></span>
          <span className="blob blob-3"></span>
        </div>
        {error && <div className="cute-error-toast">{error}</div>}
        <div
          className={`calendar-card shine-effect ${
            loading ? "opacity-30" : ""
          }`}
        >
          {viewMode === "calendar" ? (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="100%"
              events={displayEvents.map((e) => ({
                ...e,
                extendedProps: {
                  country: e.country,
                  emoji: e.emoji,
                  theme: e.theme,
                  khmerTitle: e.khmerTitle,
                },
              }))}
              headerToolbar={{ left: "prev", center: "title", right: "next" }}
              dayHeaderFormat={{ weekday: "short" }}
              dayCellClassNames={(arg) => {
                const dateStr = arg.date.toLocaleDateString("en-CA");
                return holidayDates.has(dateStr)
                  ? ["cute-day-cell", "is-holiday"]
                  : ["cute-day-cell"];
              }}
              eventContent={renderEventContent}
              eventClick={(info) => {
                const match = displayEvents.find(
                  (e) =>
                    e.title === info.event.title &&
                    e.date === info.event.startStr,
                );
                if (match) setSelectedEvent(match);
              }}
              dayMaxEvents={2}
              fixedWeekCount={false}
            />
          ) : (
            <CalendarList
              displayEvents={displayEvents}
              lang={lang}
              setSelectedEvent={setSelectedEvent}
            />
          )}
        </div>
        {loading && (
          <div className="cute-loader-overlay">
            <div className="bg-white/90 p-8 rounded-full shadow-2xl animate-spin-slow">
              <span className="text-5xl">🍩</span>
            </div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <HolidayModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          lang={lang}
        />
      )}

      {showPlanner && (
        <LeavePlannerList
          onClose={() => setShowPlanner(false)}
          lang={lang}
          year={selectedYear}
          events={apiEvents.length > 0 ? apiEvents : defaultEvents}
        />
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cute-year-select {
          background: white;
          border: 2px solid var(--cute-pink);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 800;
          cursor: pointer;
          outline: none;
          color: var(--cute-pink-dark);
          box-shadow: 0 4px 0 var(--cute-pink);
          transition: all 0.2s;
        }
        .cute-year-select:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 var(--cute-pink);
        }
        .cute-lang-toggle {
          background: white;
          border: 2px solid var(--cute-blue);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 0 var(--cute-blue);
        }
        .cute-lang-toggle:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 var(--cute-blue);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          border: 2px solid rgba(255, 255, 255, 0.6);
        }
        .shine-effect::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: rotate(45deg);
          pointer-events: none;
          animation: shine 6s infinite;
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
