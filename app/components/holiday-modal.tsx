"use client";

import React, { useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import confetti from "canvas-confetti";
import { HolidayEvent } from "./calendar-data";

interface ModalProps {
  readonly event: HolidayEvent;
  readonly onClose: () => void;
  readonly lang: "en" | "km";
}

export default function HolidayModal({ event, onClose, lang }: ModalProps) {
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
  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleDateString(lang === "km" ? "km-KH" : "en-US", {
    month: "short",
  });
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString(
    lang === "km" ? "km-KH" : "en-US",
    { weekday: "short" },
  );

  return (
    <div className="cute-modal-overlay">
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-transparent border-none cursor-default outline-none"
        onClick={onClose}
        aria-label={lang === "km" ? "បិទ" : "Close"}
      />
      <dialog
        className={`cute-modal-premium cute-theme-${event.theme || "blue"}`}
        open
        aria-modal="true"
      >
        <button
          className="cute-modal-close-premium"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex w-full h-full items-stretch p-4 gap-6 flex-col sm:flex-row">
          {/* Date Block — horizontal strip on mobile, sidebar on sm+ */}
          <div className="cute-modal-date-sidebar sm:flex-col flex-row items-center justify-center gap-4 sm:gap-0 py-4 sm:py-8 px-6 sm:px-0 rounded-3xl sm:rounded-[40px] min-w-0 sm:min-w-[140px]">
            <span className="month">{month}</span>
            <span className="day text-5xl sm:text-[64px]">{day}</span>
            <span className="weekday">{weekday}</span>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col items-start justify-center min-w-0 pr-2 sm:pr-8 pb-2 sm:pb-0">
            {event.primaryType && (
              <span className="cute-modal-type-badge-premium">
                {event.primaryType}
              </span>
            )}

            <h3
              className="cute-modal-title-premium text-2xl sm:text-[32px]"
              style={{
                fontFamily: lang === "km" ? "var(--font-khmer)" : "inherit",
              }}
            >
              {title}
            </h3>

            {event.description && (
              <p className="cute-modal-description-premium line-clamp-2 text-sm sm:text-[17px]">
                {event.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 opacity-60">
              <ReactCountryFlag
                countryCode={
                  event.country === "UN" || event.country.length > 2
                    ? "KH"
                    : event.country
                }
                svg
                style={{ width: 20, height: 16, borderRadius: 2 }}
              />
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                {event.locations || "NATIONWIDE"}
              </span>
            </div>
          </div>

          {/* Floating Emoji — hidden on mobile to prevent overflow */}
          <div className="cute-modal-emoji-premium hidden sm:block">{event.emoji}</div>
        </div>
      </dialog>
    </div>
  );
}
