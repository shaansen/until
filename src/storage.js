// All countdowns live in localStorage on THIS device only. Nothing is uploaded.
// Kept identical to the previous version's key + format so existing data carries over.
const KEY = 'countdowns.v1';

export function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Seed one example on first ever launch so the app isn't empty.
export function ensureSeeded() {
  if (localStorage.getItem(KEY) === null) {
    saveAll([{ id: uid(), title: 'Our Wedding', target: '2026-09-26T15:00:00' }]);
  }
}

// Targets are stored without a timezone ("YYYY-MM-DDTHH:mm:ss"). Parse the parts
// and build the Date with the local constructor so every read is LOCAL wall-clock
// time on every browser — never UTC.
export function targetDate(ev) {
  const [datePart, timePart = '00:00:00'] = String(ev.target).split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh = 0, mm = 0, ss = 0] = timePart.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh, mm, ss);
}

const pad = (n) => String(n).padStart(2, '0');

// Build the stored target string from a local Date + "HH:mm" time string.
export function buildTarget(dateObj, timeStr) {
  const y = dateObj.getFullYear();
  const m = pad(dateObj.getMonth() + 1);
  const d = pad(dateObj.getDate());
  let hh = 0, mm = 0;
  if (timeStr) [hh, mm] = timeStr.split(':').map(Number);
  return `${y}-${m}-${d}T${pad(hh)}:${pad(mm)}:00`;
}

export function timeStringOf(ev) {
  const d = targetDate(ev);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Years and months are calendar quantities, not fixed spans of milliseconds, so
// they are counted by walking the calendar rather than dividing the gap.

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

// `from` shifted by n months, clamping the day to the end of the landing month
// (Jan 31 + 1 month = Feb 28, not Mar 3).
export function addMonths(from, n) {
  const y = from.getFullYear();
  const m = from.getMonth() + n;
  const d = Math.min(from.getDate(), daysInMonth(y, m));
  return new Date(y, m, d, from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds());
}

// Whole calendar months from `from` to `to`; 0 if `to` is in the past.
export function wholeMonthsBetween(from, to) {
  let n = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (n < 0) return 0;
  // The month boundary only counts once the day-of-month and time are reached.
  if (addMonths(from, n) > to) n -= 1;
  return Math.max(n, 0);
}

export const UNITS = [
  { key: 'years', label: 'years', short: 'years' },
  { key: 'months', label: 'months', short: 'months' },
  { key: 'weeks', label: 'weeks', short: 'weeks', divisor: 7 * 86400000 },
  { key: 'days', label: 'days', short: 'days', divisor: 86400000 },
  { key: 'hours', label: 'hours', short: 'hours', divisor: 3600000 },
  { key: 'minutes', label: 'minutes', short: 'mins', divisor: 60000 },
  { key: 'seconds', label: 'seconds', short: 'secs', divisor: 1000 },
];

const toDate = (t) => (t instanceof Date ? t : new Date(t));

const plural = (word, n) => (n === 1 ? word.replace(/s$/, '') : word);

// Total whole `unit`s between now and the target, plus what is left over
// expressed in the next smaller unit: a 13-month gap reads "1 year 1 month"
// on the years card and "13 months 2 weeks" on the months card.
export function unitValues(index, now, target) {
  const unit = UNITS[index];
  const from = toDate(now);
  const to = toDate(target);

  let value;
  let anchor;
  if (unit.key === 'years') {
    value = Math.floor(wholeMonthsBetween(from, to) / 12);
    anchor = addMonths(from, value * 12);
  } else if (unit.key === 'months') {
    value = wholeMonthsBetween(from, to);
    anchor = addMonths(from, value);
  } else {
    value = Math.floor(Math.max(to - from, 0) / unit.divisor);
    anchor = new Date(from.getTime() + value * unit.divisor);
  }

  // What is left over, in the largest smaller unit that has anything in it, so a
  // month-and-a-day gap reads "1 month 1 day" rather than a bare "1 month".
  let rest = null;
  for (let i = index + 1; i < UNITS.length && !rest; i += 1) {
    const u = UNITS[i];
    const v = u.key === 'months'
      ? wholeMonthsBetween(anchor, to)
      : Math.floor(Math.max(to - anchor, 0) / u.divisor);
    if (v > 0) rest = { v, label: plural(u.short, v) };
  }
  return { value, label: plural(unit.label, value), rest };
}

export function unitTotal(index, now, target) {
  return unitValues(index, now, target).value;
}

// The gap as a cascade: years, then the months left over, then weeks, and so on.
export function breakdown(now, target) {
  const months = wholeMonthsBetween(now, target);
  const years = Math.floor(months / 12);
  let rem = Math.max(target - addMonths(now, months), 0);
  const take = (ms) => { const v = Math.floor(rem / ms); rem -= v * ms; return v; };
  return [
    { v: years, name: 'year' },
    { v: months - years * 12, name: 'month' },
    { v: take(7 * 86400000), name: 'week' },
    { v: take(86400000), name: 'day' },
    { v: take(3600000), name: 'hour' },
    { v: take(60000), name: 'min' },
    { v: take(1000), name: 'sec' },
  ];
}

export function fmt(n) {
  return Math.floor(n).toLocaleString('en-US');
}

// Biggest two non-zero units, for the list cards.
export function summarize(now, target) {
  if (target - now <= 0) return null;
  const parts = breakdown(now, target).filter((p) => p.v > 0).slice(0, 2);
  return parts.length ? parts : [{ v: 0, name: 'sec' }];
}

export function formatWhen(d) {
  return (
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}
