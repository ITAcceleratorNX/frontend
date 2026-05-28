const DAY_MS = 24 * 60 * 60 * 1000;

export const CONTRACT_EXPIRY_STATUS = {
  NO_END_DATE: 'NO_END_DATE',
  ENDING_SOON: 'ENDING_SOON',
  EXPIRED: 'EXPIRED',
  OK: 'OK',
};

function normalizeDate(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateDaysRemaining(endDate) {
  const end = normalizeDate(endDate);
  if (!end) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - today.getTime()) / DAY_MS);
}

export function getOrderContractExpiry(order) {
  const backendStatus = order?.contract_expiry_status;
  const backendDays = order?.contract_days_remaining;
  const endDate = order?.contract_end_date ?? order?.end_date ?? null;

  if (backendStatus) {
    return {
      status: backendStatus,
      daysRemaining: backendDays ?? calculateDaysRemaining(endDate),
      endDate,
    };
  }

  if (!endDate) {
    return { status: CONTRACT_EXPIRY_STATUS.NO_END_DATE, daysRemaining: null, endDate: null };
  }

  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining == null) {
    return { status: CONTRACT_EXPIRY_STATUS.NO_END_DATE, daysRemaining: null, endDate: null };
  }
  if (daysRemaining < 0) {
    return { status: CONTRACT_EXPIRY_STATUS.EXPIRED, daysRemaining, endDate };
  }
  if (daysRemaining <= 30) {
    return { status: CONTRACT_EXPIRY_STATUS.ENDING_SOON, daysRemaining, endDate };
  }

  return { status: CONTRACT_EXPIRY_STATUS.OK, daysRemaining, endDate };
}

