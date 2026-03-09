import { HolidayEvent } from "./calendar-data";

export interface LeaveStrategy {
  startDate: string;
  endDate: string;
  leaveDaysCount: number;
  totalBreakDays: number;
  leaveDates: string[];
  holidaysIncluded: string[];
  efficiency: number; // totalBreakDays / leaveDaysCount
  explanation: string;
}

export function calculateLeaveStrategies(
  year: number,
  events: HolidayEvent[],
  leaveAllowance: number = 18,
): LeaveStrategy[] {
  const isLeap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInYear = isLeap ? 366 : 365;
  const startDate = new Date(`${year}-01-01T00:00:00`);

  // Map of holiday dates to their names
  const holidayMap = new Map<string, string>();
  events.forEach((h) => {
    holidayMap.set(h.date, h.title);
  });

  interface DayInfo {
    dateStr: string;
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName: string | null;
    isFree: boolean; // Weekend or Holiday
  }

  const days: DayInfo[] = [];
  for (let i = 0; i < daysInYear; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun = 0, Sat = 6
    const isHoliday = holidayMap.has(dateStr);

    days.push({
      dateStr,
      isWeekend,
      isHoliday,
      holidayName: isHoliday ? holidayMap.get(dateStr)! : null,
      isFree: isWeekend || isHoliday,
    });
  }

  const candidates: LeaveStrategy[] = [];

  for (let i = 0; i < daysInYear; i++) {
    // Start of block: the day before must NOT be free, to ensure it's a maximal block
    if (i > 0 && days[i - 1].isFree) continue;

    // Evaluate blocks up to 20 days long
    for (let j = i; j < Math.min(daysInYear, i + 20); j++) {
      // End of block: the day after must NOT be free
      if (j < daysInYear - 1 && days[j + 1].isFree) continue;

      let leaveDaysCount = 0;
      let hasHoliday = false;
      const leaveDates: string[] = [];
      const holidaysIncludedSet = new Set<string>();

      for (let k = i; k <= j; k++) {
        if (!days[k].isFree) {
          leaveDaysCount++;
          leaveDates.push(days[k].dateStr);
        }
        if (days[k].isHoliday) {
          hasHoliday = true;
          holidaysIncludedSet.add(days[k].holidayName!);
        }
      }

      const totalBreakDays = j - i + 1;

      // Rules for a candidate:
      // 1. Must use at least 1 leave day.
      // 2. Must enclose at least one public holiday.
      // 3. Efficiency should be decent (e.g. at least 1.5x)
      if (leaveDaysCount > 0 && hasHoliday && totalBreakDays >= 3) {
        const efficiency = totalBreakDays / leaveDaysCount;
        if (efficiency >= 1.5) {
          // Generate an explanation
          const holidayList = Array.from(holidaysIncludedSet).join(" and ");
          const explanation = `Bridge ${holidayList} with ${leaveDaysCount} day${leaveDaysCount > 1 ? "s" : ""} of leave to gain a ${totalBreakDays}-day total break.`;

          candidates.push({
            startDate: days[i].dateStr,
            endDate: days[j].dateStr,
            leaveDaysCount,
            totalBreakDays,
            leaveDates,
            holidaysIncluded: Array.from(holidaysIncludedSet),
            efficiency,
            explanation,
          });
        }
      }
    }
  }

  // Sort all candidates by efficiency, then longest break, then fewest leave days
  candidates.sort((a, b) => {
    if (b.efficiency !== a.efficiency) return b.efficiency - a.efficiency;
    if (b.totalBreakDays !== a.totalBreakDays)
      return b.totalBreakDays - a.totalBreakDays;
    return a.leaveDaysCount - b.leaveDaysCount;
  });

  // Greedy selection
  const selectedStrategies: LeaveStrategy[] = [];
  const usedDates = new Set<string>();
  let remainingLeave = leaveAllowance;

  for (const candidate of candidates) {
    if (remainingLeave <= 0) break;
    if (candidate.leaveDaysCount > remainingLeave) continue;

    // Check if any day in this candidate's period is already used
    let overlaps = false;
    const cur = new Date(candidate.startDate);
    const end = new Date(candidate.endDate);
    while (cur <= end) {
      if (usedDates.has(cur.toISOString().split("T")[0])) {
        overlaps = true;
        break;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (!overlaps) {
      selectedStrategies.push(candidate);
      remainingLeave -= candidate.leaveDaysCount;

      // Mark all days in this candidate's period as used
      const markCur = new Date(candidate.startDate);
      const markEnd = new Date(candidate.endDate);
      while (markCur <= markEnd) {
        usedDates.add(markCur.toISOString().split("T")[0]);
        markCur.setDate(markCur.getDate() + 1);
      }
    }
  }

  // Sort the final strategies chronologically
  selectedStrategies.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return selectedStrategies;
}
