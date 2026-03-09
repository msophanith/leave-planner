import { LeaveStrategy } from "./leave-calculator";

/**
 * Generates a .ics file content from a list of leave strategies.
 * Each strategy becomes two events: the full break period + the leave days.
 */
export function generateIcal(
  strategies: LeaveStrategy[],
  year: number,
): string {
  const now = new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}/, "");

  const uid = () => `${Math.random().toString(36).slice(2)}@holidays-buddy`;

  const formatDate = (dateStr: string) => dateStr.replaceAll("-", "");

  const formatDateEnd = (dateStr: string) => {
    // iCal DTEND for all-day events is exclusive (next day)
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10).replaceAll("-", "");
  };

  const escape = (str: string) =>
    str
      .replaceAll("\n", String.raw`\n`)
      .replaceAll(",", String.raw`\,`)
      .replaceAll(";", String.raw`\;`);

  const events = strategies
    .map((s) => {
      const leaveLabel = `Apply Annual Leave (${s.leaveDaysCount}d → ${s.totalBreakDays}d off)`;
      const desc = escape(s.explanation);
      const leaveDatesStr = s.leaveDates
        .map((d) =>
          new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        )
        .join(", ");

      const lastLeaveDate = s.leaveDates.at(-1) ?? s.leaveDates[0];
      const newline = String.raw`\n`;
      const breakDesc = `DESCRIPTION:${desc}${newline}${newline}Leave days: ${escape(leaveDatesStr)}`;
      const holidaySummary = `SUMMARY:\uD83C\uDFD6\uFE0F ${escape(s.holidaysIncluded.join(" + "))} Break`;

      return [
        // ── Break Period block ──
        "BEGIN:VEVENT",
        `UID:break-${uid()}`,
        `DTSTAMP:${now}Z`,
        `DTSTART;VALUE=DATE:${formatDate(s.startDate)}`,
        `DTEND;VALUE=DATE:${formatDateEnd(s.endDate)}`,
        holidaySummary,
        breakDesc,
        "STATUS:CONFIRMED",
        "TRANSP:TRANSPARENT",
        "END:VEVENT",

        // ── Reminder: first leave day ──
        "BEGIN:VEVENT",
        `UID:leave-${uid()}`,
        `DTSTAMP:${now}Z`,
        `DTSTART;VALUE=DATE:${formatDate(s.leaveDates[0])}`,
        `DTEND;VALUE=DATE:${formatDateEnd(lastLeaveDate)}`,
        `SUMMARY:📋 ${escape(leaveLabel)}`,
        `DESCRIPTION:Submit annual leave for: ${escape(leaveDatesStr)}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
      ].join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Holidays Buddy//Leave Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:🏖️ Holidays Buddy ${year} Leave Plan`,
    "X-WR-TIMEZONE:Asia/Phnom_Penh",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcal(strategies: LeaveStrategy[], year: number): void {
  const content = generateIcal(strategies, year);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `holidays-buddy-${year}-leave-plan.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
