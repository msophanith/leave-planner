import React, { useMemo, useState } from "react";
import { calculateLeaveStrategies } from "./leave-calculator";
import { downloadIcal } from "./ical-export";
import { HolidayEvent } from "./calendar-data";
import html2canvas from "html2canvas";
import StrategyCard from "./strategy-card";

interface LeavePlannerListProps {
  readonly lang: "en" | "km";
  readonly year: number;
  readonly events: HolidayEvent[];
  readonly onClose: () => void;
}

export default function LeavePlannerList({
  lang,
  year,
  events,
  onClose,
}: LeavePlannerListProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [leaveAllowance, setLeaveAllowance] = useState(18);
  const [exporting, setExporting] = useState(false);

  const strategies = useMemo(
    () => calculateLeaveStrategies(year, events, leaveAllowance),
    [year, events, leaveAllowance],
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
    const remaining = leaveAllowance - totalLeaveUsed;
    return { totalLeaveUsed, totalDaysOff, efficiency, remaining };
  }, [strategies, leaveAllowance]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      downloadIcal(strategies, year);
      setExporting(false);
    }, 400);
  };

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

  const formatDate = (dateStr: string, opts?: Intl.DateTimeFormatOptions) =>
    new Date(dateStr).toLocaleDateString(
      lang === "km" ? "km-KH" : "en-US",
      opts ?? { month: "short", day: "numeric" },
    );

  const handleShare = async (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    try {
      const element = globalThis.document.getElementById(
        `strategy-card-${cardId}`,
      );
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById(`strategy-card-${cardId}`);
          if (el) {
            // 🛑 DEEP COLOR SANITIZATION
            // html2canvas crashes on lab(), oklch(), etc.
            const allElements = el.querySelectorAll("*");
            const sanitize = (val: string) => {
              if (!val) return val;
              const unsupported = ["lab(", "oklch(", "oklab(", "lch("];
              if (unsupported.some((chunk) => val.includes(chunk))) {
                return "#71717a"; // Safe gray fallback
              }
              return val;
            };

            for (const item of Array.from(allElements)) {
              const htmlItem = item as HTMLElement;
              const computed = globalThis.getComputedStyle(htmlItem);

              const color = sanitize(computed.color);
              if (color !== computed.color) {
                htmlItem.style.setProperty("color", color, "important");
              }

              const bg = sanitize(computed.backgroundColor);
              if (bg !== computed.backgroundColor) {
                htmlItem.style.setProperty("background-color", bg, "important");
              }

              const border = sanitize(computed.borderColor);
              if (border !== computed.borderColor) {
                htmlItem.style.setProperty("border-color", border, "important");
              }

              const shadow = sanitize(computed.boxShadow);
              if (shadow !== computed.boxShadow) {
                htmlItem.style.setProperty("box-shadow", "none", "important");
              }
            }

            // Hide action buttons in the clone
            const actions = el.querySelectorAll(".wanderlust-actions");
            for (const a of Array.from(actions)) {
              (a as HTMLElement).style.display = "none";
            }

            // Remove animations
            const animated = el.querySelectorAll(
              ".animate-pulse, .animate-ping, .animate-bounce",
            );
            for (const a of Array.from(animated)) {
              const h = a as HTMLElement;
              h.style.animation = "none";
              h.classList.remove(
                "animate-pulse",
                "animate-ping",
                "animate-bounce",
              );
            }
          }
        },
      });

      const url = canvas.toDataURL("image/png");
      const a = globalThis.document.createElement("a");
      a.href = url;
      a.download = `holiday-strategy-${cardId}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  return (
    <div
      className="absolute inset-0 z-200 flex items-center justify-center p-4 sm:p-8 lg:p-12"
      style={{ padding: 16 }}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm cursor-default border-none outline-none"
        onClick={onClose}
        aria-label={lang === "km" ? "បិទ" : "Close"}
      />

      <div
        className="relative w-full max-w-7xl max-h-[85vh] flex flex-col overflow-hidden font-nunito bg-white shadow-2xl leave-planner-panel"
        style={{ margin: "0 16px" }}
      >
        {/* Top Bar */}
        <div
          className="flex items-center justify-between shrink-0 leave-planner-topbar"
          style={{ padding: 16 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🤖</span>
            <div>
              <h2
                className="text-xl font-black tracking-tight"
                style={{ color: "var(--text-main)" }}
              >
                {lang === "km"
                  ? "ជំនួយការសម្រាកប្រចាំឆ្នាំ"
                  : "AI Leave Assistant"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {lang === "km" ? "ថ្ងៃ AL:" : "AL Budget:"}
                </span>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={leaveAllowance}
                  onChange={(e) => setLeaveAllowance(Number(e.target.value))}
                  className="w-20 accent-pink-400 cursor-pointer"
                  aria-label="Annual leave allowance"
                />
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={leaveAllowance}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(60, Number(e.target.value)));
                    setLeaveAllowance(v);
                  }}
                  className="w-12 text-center text-sm font-black text-pink-600 border-2 border-pink-200 outline-none focus:border-pink-400 transition-colors"
                  aria-label="Annual leave days"
                />
                <span className="text-[11px] font-bold text-gray-400">
                  {lang === "km" ? "ថ្ងៃ" : "days"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting || strategies.length === 0}
              className="cute-export-btn"
              title="Export to .ics calendar file"
            >
              {exporting ? "⏳" : "📅"}{" "}
              {lang === "km" ? "នាំចេញ .ics" : "Export .ics"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors bg-red-400 text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto space-y-12 custom-scrollbar leave-planner-scroll"
          style={{ padding: 24 }}
        >
          {Object.entries(groupedStrategies).map(
            ([monthYear, monthStrategies]) => (
              <div key={monthYear} className="space-y-6">
                <div
                  className="inline-flex items-center gap-2 px-5 py-2 border-2 border-dashed leave-planner-month-header"
                  style={{ borderColor: "var(--cute-pink)" }}
                >
                  <span className="text-sm font-black text-gray-700">
                    {monthYear} ✿
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {monthStrategies.map((strategy, idx) => (
                    <StrategyCard
                      key={`${strategy.startDate}-${strategy.endDate}`}
                      strategy={strategy}
                      idx={idx}
                      lang={lang}
                      onShare={handleShare}
                      onCopy={handleCopy}
                      isCopied={
                        copied ===
                        `${strategy.startDate.replaceAll(" ", "")}-${strategy.endDate.replaceAll(" ", "")}`
                      }
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            ),
          )}

          <div className="p-6 bg-gray-50/30 leave-planner-summary">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2
                  className="text-2xl font-black mb-1"
                  style={{ color: "var(--text-main)" }}
                >
                  Strategy Overview
                </h2>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--text-soft)" }}
                >
                  {lang === "km"
                    ? "ផែនការសម្រាកល្អបំផុតរបស់អ្នក"
                    : `Your optimal ${leaveAllowance}-day holiday roadmap`}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full md:w-auto">
                {[
                  {
                    label: lang === "km" ? "ប្រើប្រាស់" : "Used",
                    val: `${summary.totalLeaveUsed}d`,
                    color: "text-red-500",
                  },
                  {
                    label: lang === "km" ? "នៅសល់" : "Remaining",
                    val: `${summary.remaining}d`,
                    color:
                      summary.remaining < 0
                        ? "text-red-600"
                        : "text-emerald-600",
                  },
                  {
                    label: lang === "km" ? "ថ្ងៃសម្រាក" : "Off",
                    val: `${summary.totalDaysOff}d`,
                    color: "text-green-600",
                  },
                  {
                    label: lang === "km" ? "ប្រសិទ្ធភាព" : "Efficiency",
                    val: `${summary.efficiency}x`,
                    color: "text-blue-600",
                  },
                  {
                    label: lang === "km" ? "ចំណេញ" : "Gain",
                    val: `+${summary.totalDaysOff - summary.totalLeaveUsed}d`,
                    color: "text-orange-500",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="text-center shadow-sm leave-planner-stat p-4"
                  >
                    <div
                      className="text-[10px] font-black uppercase mb-1 tracking-widest"
                      style={{ color: "var(--text-soft)" }}
                    >
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
  );
}
