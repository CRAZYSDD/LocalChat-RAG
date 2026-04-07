function normalizeDateInput(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);

  const text = String(value).trim();
  if (!text) return null;

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(text);
  return new Date(hasTimezone ? text : `${text}Z`);
}

export function parseDateValue(value) {
  const parsed = normalizeDateInput(value);
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

export function formatTime(value) {
  const parsed = parseDateValue(value);
  if (!parsed) return '--';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

export function truncate(text, length = 48) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
}
