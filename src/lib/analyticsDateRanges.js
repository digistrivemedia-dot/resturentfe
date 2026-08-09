// Date-range preset resolution for the restaurant analytics section.
// Always resolves to explicit Date objects so the backend never has to guess
// what "This Week" means in the caller's timezone — the browser resolves it.

export const DATE_PRESETS = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "Last 3 Months",
  "Last 6 Months",
  "This Year",
  "Custom",
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() - (day === 0 ? 6 : day - 1)); // Monday start
  return x;
}

export function resolveDateRange(preset, customStart, customEnd) {
  const now = new Date();

  switch (preset) {
    case "Today":
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case "Yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { startDate: startOfDay(y), endDate: endOfDay(y) };
    }
    case "This Week":
      return { startDate: startOfWeek(now), endDate: endOfDay(now) };
    case "Last Week": {
      const thisWeekStart = startOfWeek(now);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setMilliseconds(-1);
      return { startDate: lastWeekStart, endDate: lastWeekEnd };
    }
    case "This Month":
      return { startDate: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: endOfDay(now) };
    case "Last Month": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: startOfDay(lastMonthStart), endDate: endOfDay(lastMonthEnd) };
    }
    case "Last 3 Months": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      return { startDate: startOfDay(start), endDate: endOfDay(now) };
    }
    case "Last 6 Months": {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 6);
      return { startDate: startOfDay(start), endDate: endOfDay(now) };
    }
    case "This Year":
      return { startDate: startOfDay(new Date(now.getFullYear(), 0, 1)), endDate: endOfDay(now) };
    case "Custom":
      return {
        startDate: customStart ? startOfDay(new Date(customStart)) : startOfWeek(now),
        endDate: customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now),
      };
    default:
      return { startDate: startOfWeek(now), endDate: endOfDay(now) };
  }
}
