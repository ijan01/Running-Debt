
import { User, DailyReport } from './types.ts';

export const calculateDailyTarget = (month: number, day: number): number => {
  return parseFloat((month + day * 0.1).toFixed(2));
};

const parseLocalDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

export const generateUserReports = (user: User, simDate: string): DailyReport[] => {
  const reports: DailyReport[] = [];
  const programStartStr = "2026-01-01";
  const simDateObj = parseLocalDate(simDate);
  const year = 2026;

  let cumulativeTarget = 0;
  let cumulativeRun = 0;
  const simMonth = simDateObj.getMonth();

  // We iterate through every day from Jan 1st to simDate to calculate running totals
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, m, d);
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dailyTarget = calculateDailyTarget(m + 1, d);
      const totalRunOnDay = user.logs
        .filter(l => l.date === dateStr)
        .reduce((acc, curr) => acc + curr.distance, 0);

      const joinDateObj = parseLocalDate(user.joinDate || programStartStr);
      
      // Calculate totals only up to the simulation date
      if (currentDate <= simDateObj) {
        // Target accumulation starts from the user's specific join date
        if (currentDate >= joinDateObj) {
          cumulativeTarget = parseFloat((cumulativeTarget + dailyTarget).toFixed(2));
        }
        cumulativeRun = parseFloat((cumulativeRun + totalRunOnDay).toFixed(2));
      }

      // We only store report items for the month being viewed in the UI
      if (m === simMonth) {
        const debt = Math.max(0, parseFloat((cumulativeTarget - cumulativeRun).toFixed(2)));
        reports.push({
          date: dateStr,
          target: dailyTarget,
          run: totalRunOnDay,
          debtAdded: Math.max(0, dailyTarget - totalRunOnDay),
          debtCleared: 0, // Simplified for capped logic
          cumulativeDebt: debt,
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
  "Most people quit at 40%. You haven't even started.",
  "I don't stop when I'm tired. I stop when I'm done!",
  "Stay hard! The surplus you think you have is a lie.",
  "You're either getting better or you're getting worse. You're never staying the same."
];
