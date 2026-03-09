"use client";

import React from "react";
import ReactCountryFlag from "react-country-flag";

interface CalendarHeaderProps {
  readonly lang: "en" | "km";
  readonly selectedYear: number;
  readonly setSelectedYear: (year: number) => void;
  readonly country: string;
  readonly setCountry: (country: string) => void;
  readonly viewMode: "calendar" | "list";
  readonly setViewMode: React.Dispatch<
    React.SetStateAction<"calendar" | "list">
  >;
  readonly showPlanner: boolean;
  readonly setShowPlanner: (show: boolean) => void;
  readonly showCountdown: boolean;
  readonly setShowCountdown: (show: boolean) => void;
  readonly darkMode: boolean;
  readonly toggleDarkMode: () => void;
  readonly setLang: React.Dispatch<React.SetStateAction<"en" | "km">>;
}

export default function CalendarHeader({
  lang,
  selectedYear,
  setSelectedYear,
  country,
  setCountry,
  viewMode,
  setViewMode,
  showPlanner,
  setShowPlanner,
  showCountdown,
  setShowCountdown,
  darkMode,
  toggleDarkMode,
  setLang,
}: CalendarHeaderProps) {
  // Labels logic - Flattened to satisfy linter and improve readability
  const holidayListLabel =
    lang === "km" ? "📋 បញ្ជីថ្ងៃឈប់សម្រាក" : "📋 List of Holidays";
  const calendarLabel = lang === "km" ? "📅 កាលវិភាគ" : "📅 Calendar";
  const viewModeLabel =
    viewMode === "calendar" ? holidayListLabel : calendarLabel;

  const lightModeLabel = lang === "km" ? "☀️ ពន្លឺ" : "☀️ Light";
  const darkModeIconLabel = lang === "km" ? "🌙 ងងឹត" : "🌙 Dark";
  const darkModeLabel = darkMode ? lightModeLabel : darkModeIconLabel;

  return (
    <header className="cute-header glass-card p-6 mb-6 rounded-md animate-slide-down">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="cute-title">Holidays Buddy ✿</h1>
          <p className="cute-subtitle">A cute guide to your days off! ✨</p>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowCountdown(!showCountdown)}
            className="cute-lang-toggle lg:hidden bg-pink-50 text-pink-600 border-pink-200"
          >
            {lang === "km" ? "⭐ បុណ្យបន្ទាប់" : "⭐ Next Holiday"}
          </button>
          <div className="cute-select-container">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="cute-select"
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
            <span className="cute-select-arrow">▼</span>
          </div>

          <div className="cute-select-container">
            <ReactCountryFlag
              countryCode={country}
              svg
              style={{ width: 22, height: 16, borderRadius: 2 }}
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="cute-select"
            >
              <option value="KH">Cambodia</option>
              <option value="SG">Singapore</option>
              <option value="JP">Japan</option>
              <option value="LA">Lao</option>
              <option value="MY">Malaysia</option>
              <option value="VN">Vietnam</option>
              <option value="KR">South Korea</option>
              <option value="ID">Indonesia</option>
              <option value="PH">Philippines</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
            </select>
            <span className="cute-select-arrow">▼</span>
          </div>
          <button
            onClick={() =>
              setViewMode((v) => (v === "calendar" ? "list" : "calendar"))
            }
            className="cute-lang-toggle"
            style={{
              fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
            }}
          >
            {viewModeLabel}
          </button>
          <button
            onClick={() => setShowPlanner(!showPlanner)}
            className="cute-lang-toggle bg-[#fff0f3] text-pink-600 border-pink-400"
            style={{
              fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
            }}
          >
            {lang === "km" ? "✈️ អ្នករៀបចំផែនការ" : "✈️ AI Leave Planner"}
          </button>
          <button
            onClick={toggleDarkMode}
            className="cute-lang-toggle"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            style={{
              fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
            }}
          >
            {darkModeLabel}
          </button>
          <button
            onClick={() => setLang((l) => (l === "en" ? "km" : "en"))}
            className="cute-lang-toggle"
          >
            {lang === "en" ? "🇰🇭 ខ្មែរ" : "🇺🇸 English"}
          </button>
        </div>
      </div>
    </header>
  );
}
