"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import kmLocale from "@fullcalendar/core/locales/km";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import HolidayModal from "./holiday-modal";
import CalendarHeader from "./calendar-header";
import "./calendar.css";

import {
  HolidayEvent,
  KHMER_TRANSLATIONS,
  BASE_PLACEHOLDERS,
  getEmojiForHoliday,
  getThemeForHoliday,
} from "./calendar-data";
import CalendarList from "./calendar-list";
import LeavePlannerList from "./leave-planner-list";
import NextHolidayCountdown from "./next-holiday-countdown";

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
  const [country, setCountry] = useState<string>("KH");
  const [darkMode, setDarkMode] = useState(false);
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
        `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${selectedYear}`,
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
          description: string;
          date: { iso: string };
          country: { id: string };
          type: string[];
          primary_type: string;
          locations: string;
          canonical_url: string;
        }) => {
          const dateStr = h.date?.iso || "";
          const month = new Date(dateStr).getMonth();
          return {
            title: h.name,
            khmerTitle: KHMER_TRANSLATIONS[h.name] || h.name,
            date: dateStr.split("T")[0],
            country: h.country?.id?.toUpperCase() || country,
            theme: getThemeForHoliday(h.name, month),
            emoji: getEmojiForHoliday(h.name, month),
            description: h.description || "",
            primaryType: h.primary_type || "Public Holiday",
            types: h.type || [],
            locations: h.locations || "All",
            canonicalUrl: h.canonical_url || "",
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
  }, [selectedYear, country]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // --- Dark mode: restore from localStorage on mount ---
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.dataset.theme = "dark";
      localStorage.setItem("darkMode", "true");
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.setItem("darkMode", "false");
    }
  };

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
      <CalendarHeader
        lang={lang}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        country={country}
        setCountry={setCountry}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showPlanner={showPlanner}
        setShowPlanner={setShowPlanner}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setLang={setLang}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-stretch flex-1 min-h-0">
        <aside className="w-full lg:w-[28%] lg:sticky lg:top-8 animate-slide-left flex flex-col min-h-0">
          <NextHolidayCountdown
            events={apiEvents}
            lang={lang}
            country={country}
          />
        </aside>

        <div className="w-full lg:w-[72%] flex-1 flex flex-col min-h-0 relative">
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
                  locales={[kmLocale]}
                  locale={lang}
                  events={displayEvents.map((e) => ({
                    ...e,
                    extendedProps: {
                      country: e.country,
                      emoji: e.emoji,
                      theme: e.theme,
                      khmerTitle: e.khmerTitle,
                    },
                  }))}
                  headerToolbar={{
                    left: "prev",
                    center: "title",
                    right: "next",
                  }}
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
        </div>
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
    </div>
  );
}
