export const formatAmount = (v) => (v != null ? Number(v).toLocaleString('ru-RU') + ' ₸' : '—');

export const formatPeriod = (month, year) => (month && year ? `${String(month).padStart(2, '0')}/${year}` : '—');

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ru-RU') : '—');

export const formatClient = (user) => {
  if (!user) return '—';
  const parts = [user.phone, user.name].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};
