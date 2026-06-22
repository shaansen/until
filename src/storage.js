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

export const UNITS = [
  { key: 'weeks', label: 'weeks', short: 'weeks', divisor: 7 * 86400000 },
  { key: 'days', label: 'days', short: 'days', divisor: 86400000 },
  { key: 'hours', label: 'hours', short: 'hours', divisor: 3600000 },
  { key: 'minutes', label: 'minutes', short: 'mins', divisor: 60000 },
  { key: 'seconds', label: 'seconds', short: 'secs', divisor: 1000 },
];

export function fmt(n) {
  return Math.floor(n).toLocaleString('en-US');
}

// Biggest two non-zero units, for the list cards.
export function summarize(diff) {
  if (diff <= 0) return null;
  const parts = [];
  let rem = diff;
  const steps = [
    ['week', 7 * 86400000],
    ['day', 86400000],
    ['hour', 3600000],
    ['min', 60000],
  ];
  for (const [name, ms] of steps) {
    const v = Math.floor(rem / ms);
    if (v > 0) { parts.push({ v, name }); rem -= v * ms; }
    if (parts.length === 2) break;
  }
  if (parts.length === 0) parts.push({ v: Math.floor(diff / 1000), name: 'sec' });
  return parts;
}

export function formatWhen(d) {
  return (
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}
