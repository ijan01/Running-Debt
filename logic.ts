
import { LogEntry, DailyReport, User } from './types';

/**
 * Formula: Daily Target = (CurrentMonth) + (DayOfMonth * 0.1)
 * Jan 1: 1 + 0.1 = 1.1km
 * Feb 1: 2 + 0.1 = 2.1km
 * Dec 31: 12 + 3.1 = 15.1km
 */
export const calculateDailyTarget = (month: number, day: number): number => {
  return parseFloat((month + day * 0.1).toFixed(2));
};

const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

export const getDaysBetween = (startStr: string, endStr: string): number => {
  const s = parseLocalDate(startStr);
  const e = parseLocalDate(endStr);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

export const generateUserReports = (user: User, simDate: string): DailyReport[] => {
  const reports: DailyReport[] = [];
  const programStartStr = "2026-01-01";
  const simDateObj = parseLocalDate(simDate);
  const year = 2026;

  let cumulativeTarget = 0;
  let cumulativeRun = 0;

  // Iterate through the whole year to calculate cumulative debt properly
  // but we return reports for the current month context to keep the UI focused.
  const simMonth = simDateObj.getMonth();

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, m, d);
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dailyTarget = calculateDailyTarget(m + 1, d);
      const dailyLogs = user.logs.filter(l => l.date === dateStr);
      const totalRunOnDay = dailyLogs.reduce((acc, curr) => acc + curr.distance, 0);

      // We track cumulative progress since the join date
      const joinDateObj = parseLocalDate(user.joinDate || programStartStr);
      
      if (currentDate >= joinDateObj && currentDate <= simDateObj) {
        cumulativeTarget = parseFloat((cumulativeTarget + dailyTarget).toFixed(2));
        cumulativeRun = parseFloat((cumulativeRun + totalRunOnDay).toFixed(2));
      }

      const currentDebt = Math.max(0, parseFloat((cumulativeTarget - cumulativeRun).toFixed(2)));

      // We only collect reports for the month of the simulation date
      if (m === simMonth) {
        reports.push({
          date: dateStr,
          target: dailyTarget,
          run: totalRunOnDay,
          debtAdded: Math.max(0, dailyTarget - totalRunOnDay),
          debtCleared: Math.max(0, totalRunOnDay - dailyTarget),
          cumulativeDebt: currentDebt,
          cumulativeTarget,
          cumulativeRun
        });
      }
    }
  }

  return reports;
};

export const GOGGINS_QUOTES = [
  "The ground doesn't care if your legs hurt. Get it done.",
  "The clock is ticking and you’re still horizontal. Pay the rent.",
  "Comfort is a slow death. Stay uncommon.",
  "Pay the man. Today is a new debt. Pay up.",
  "WHO'S GONNA CARRY THE BOATS AND THE LOGS?",
  "The couch is calling your name! Get out there!",
  "Don't stop when you're tired. Stop when you're done.",
  "Most people quit at 40%. You haven't even started."
];
