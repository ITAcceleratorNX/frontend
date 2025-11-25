import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../../../shared/api/statisticsApi';

const INITIAL_FILTERS = {
  period: 'year',
  warehouse: 'all',
  storageType: 'all',
  applicationStatus: 'all',
  paymentStatus: 'all',
  contractStatus: 'all',
  leadSource: 'all',
};

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Последняя неделя' },
  { value: 'month', label: 'Последний месяц' },
  { value: 'quarter', label: 'Последний квартал' },
  { value: 'year', label: 'Последний год' },
  { value: 'all', label: 'За всё время' },
];

const WAREHOUSE_OPTIONS = [
  { value: 'all', label: 'Все склады' },
  { value: 'Mega', label: 'Mega Tower Almaty, жилой комплекс' },
  { value: 'Комфорт', label: 'Жилой комплекс «Комфорт Сити»' },
  { value: 'Есентай', label: 'Есентай, жилой комплекс' },
];

const STORAGE_TYPE_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  { value: 'individual', label: 'Индивидуальное' },
  { value: 'cloud', label: 'Облачное' },
  { value: 'hybrid', label: 'Гибридное' },
];

const APPLICATION_STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'INACTIVE', label: 'Неактивна' },
  { value: 'ACTIVE', label: 'Активна' },
  { value: 'APPROVED', label: 'Одобрена' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'CANCELED', label: 'Отменена' },
  { value: 'FINISHED', label: 'Завершена' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'PAID', label: 'Оплачено' },
  { value: 'UNPAID', label: 'Не оплачено' },
];

const CONTRACT_STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'SIGNED', label: 'Подписан' },
  { value: 'UNSIGNED', label: 'Не подписан' },
];

const LEAD_SOURCE_OPTIONS = [
  { value: 'all', label: 'Все источники' },
  { value: 'site', label: 'Сайт' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'ads', label: 'Реклама' },
];

const REQUEST_STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'INACTIVE', label: 'Неактивна' },
  { value: 'ACTIVE', label: 'Активна' },
  { value: 'APPROVED', label: 'Одобрена' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'CANCELED', label: 'Отменена' },
  { value: 'FINISHED', label: 'Завершена' },
];

const REQUESTS_DATA = [
  { id: 251, client: 'Юлия', warehouse: 'Box 127', status: 'FINISHED', amount: 16000 },
  { id: 250, client: 'Максим', warehouse: 'ЖК Средний', status: 'INACTIVE', amount: 27000 },
  { id: 249, client: 'Анна', warehouse: 'Box 214', status: 'PROCESSING', amount: 10000 },
  { id: 248, client: 'Иван', warehouse: 'Центр', status: 'ACTIVE', amount: 42000 },
  { id: 247, client: 'Сергей', warehouse: 'Комфорт', status: 'FINISHED', amount: 35500 },
  { id: 246, client: 'Дарья', warehouse: 'Atlas', status: 'PROCESSING', amount: 18500 },
  { id: 245, client: 'Алексей', warehouse: 'Мега', status: 'CANCELED', amount: 0 },
  { id: 244, client: 'Лейла', warehouse: 'Есентай', status: 'ACTIVE', amount: 33200 },
];

const ACTION_TYPE_OPTIONS = [
  { value: 'all', label: 'Все действия' },
  { value: 'create', label: 'Создание' },
  { value: 'update', label: 'Изменение' },
  { value: 'approve', label: 'Подписание' },
  { value: 'cancel', label: 'Отмена / Возврат' },
];

const ACTION_LOGS_DATA = [
  {
    id: 812,
    user: 'Ирина С.',
    type: 'create',
    action: 'Создала заявку',
    target: 'Заявка #252 (Box 117)',
    datetime: '2025-01-22 09:34',
  },
  {
    id: 811,
    user: 'Олег П.',
    type: 'update',
    action: 'Изменил стоимость хранения',
    target: 'Заявка #251 (Box 127)',
    datetime: '2025-01-22 09:02',
  },
  {
    id: 810,
    user: 'Гульназ Т.',
    type: 'approve',
    action: 'Подписала договор',
    target: 'Контракт #149 (ЖК Средний)',
    datetime: '2025-01-21 18:25',
  },
  {
    id: 809,
    user: 'Ирина С.',
    type: 'cancel',
    action: 'Отменила бронь',
    target: 'Заявка #245 (Мега)',
    datetime: '2025-01-21 17:12',
  },
  {
    id: 808,
    user: 'Максим Р.',
    type: 'update',
    action: 'Добавил комментарий',
    target: 'Заявка #249 (Box 214)',
    datetime: '2025-01-21 15:46',
  },
  {
    id: 807,
    user: 'Олег П.',
    type: 'create',
    action: 'Создал лид',
    target: 'Лид WhatsApp (Наталья)',
    datetime: '2025-01-21 14:05',
  },
  {
    id: 806,
    user: 'Гульназ Т.',
    type: 'cancel',
    action: 'Оформила возврат',
    target: 'Заявка #240 (Atlas)',
    datetime: '2025-01-21 12:48',
  },
];

const STATUS_BADGE_STYLES = {
  INACTIVE: 'bg-emerald-100 text-emerald-600',
  ACTIVE: 'bg-sky-100 text-sky-600',
  APPROVED: 'bg-blue-100 text-blue-600',
  PROCESSING: 'bg-amber-100 text-amber-600',
  CANCELED: 'bg-rose-100 text-rose-600',
  FINISHED: 'bg-slate-100 text-slate-700',
};

const STATUS_LABELS = {
  INACTIVE: 'Неактивна',
  ACTIVE: 'Активна',
  APPROVED: 'Одобрена',
  PROCESSING: 'В обработке',
  CANCELED: 'Отменена',
  FINISHED: 'Завершена',
};

const BASE_SUMMARY = {
  week: {
    requests: 58,
    paidRequests: 41,
    salesTotal: 410000,
    leads: 22,
    occupancy: 63,
    returns: 2,
  },
  month: {
    requests: 235,
    paidRequests: 180,
    salesTotal: 1200000,
    leads: 65,
    occupancy: 68,
    returns: 12,
  },
  quarter: {
    requests: 612,
    paidRequests: 482,
    salesTotal: 3650000,
    leads: 182,
    occupancy: 70,
    returns: 28,
  },
  year: {
    requests: 2480,
    paidRequests: 1875,
    salesTotal: 14800000,
    leads: 820,
    occupancy: 74,
    returns: 97,
  },
  all: {
    requests: 6120,
    paidRequests: 4768,
    salesTotal: 41200000,
    leads: 2054,
    occupancy: 76,
    returns: 182,
  },
};

const BASE_SERIES = {
  week: {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    requests: [48, 52, 55, 60, 62, 58, 50],
    sales: [34, 36, 38, 42, 44, 43, 39],
  },
  month: {
    labels: ['1 нед', '2 нед', '3 нед', '4 нед'],
    requests: [180, 210, 230, 215],
    sales: [120, 145, 160, 150],
  },
  quarter: {
    labels: ['Янв', 'Фев', 'Мар'],
    requests: [190, 205, 217],
    sales: [128, 137, 149],
  },
  year: {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    requests: [180, 195, 210, 240, 260, 275, 290, 305, 298, 285, 275, 265],
    sales: [110, 122, 135, 150, 168, 178, 185, 195, 188, 180, 172, 168],
  },
  all: {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    requests: [420, 640, 980, 1420, 1980, 2480],
    sales: [260, 380, 540, 820, 1110, 1480],
  },
};

const BASE_LEAD_SOURCES = {
  week: [
    { label: 'Сайт', value: 32, color: '#3B82F6', key: 'site' },
    { label: 'WhatsApp', value: 24, color: '#22C55E', key: 'whatsapp' },
    { label: 'Telegram', value: 18, color: '#0EA5E9', key: 'telegram' },
    { label: 'Instagram', value: 16, color: '#F97316', key: 'instagram' },
    { label: 'Реклама', value: 10, color: '#6366F1', key: 'ads' },
  ],
  month: [
    { label: 'Сайт', value: 36, color: '#3B82F6', key: 'site' },
    { label: 'WhatsApp', value: 20, color: '#22C55E', key: 'whatsapp' },
    { label: 'Telegram', value: 18, color: '#0EA5E9', key: 'telegram' },
    { label: 'Instagram', value: 16, color: '#F97316', key: 'instagram' },
    { label: 'Реклама', value: 10, color: '#6366F1', key: 'ads' },
  ],
  quarter: [
    { label: 'Сайт', value: 34, color: '#3B82F6', key: 'site' },
    { label: 'WhatsApp', value: 22, color: '#22C55E', key: 'whatsapp' },
    { label: 'Telegram', value: 20, color: '#0EA5E9', key: 'telegram' },
    { label: 'Instagram', value: 14, color: '#F97316', key: 'instagram' },
    { label: 'Реклама', value: 10, color: '#6366F1', key: 'ads' },
  ],
  year: [
    { label: 'Сайт', value: 36, color: '#3B82F6', key: 'site' },
    { label: 'WhatsApp', value: 20, color: '#22C55E', key: 'whatsapp' },
    { label: 'Telegram', value: 22, color: '#0EA5E9', key: 'telegram' },
    { label: 'Instagram', value: 12, color: '#F97316', key: 'instagram' },
    { label: 'Реклама', value: 10, color: '#6366F1', key: 'ads' },
    { label: 'Реферальная программа', value: 8, color: '#F59E0B', key: 'referral' },
  ],
  all: [
    { label: 'Сайт', value: 38, color: '#3B82F6', key: 'site' },
    { label: 'WhatsApp', value: 18, color: '#22C55E', key: 'whatsapp' },
    { label: 'Telegram', value: 18, color: '#0EA5E9', key: 'telegram' },
    { label: 'Instagram', value: 12, color: '#F97316', key: 'instagram' },
    { label: 'Реклама', value: 8, color: '#6366F1', key: 'ads' },
    { label: 'Реферальная программа', value: 6, color: '#F59E0B', key: 'referral' },
  ],
};

const CARD_STYLES = {
  requests: 'from-[#1E3A8A] to-[#1D4ED8]',
  paidRequests: 'from-[#0F766E] to-[#14B8A6]',
  salesTotal: 'from-[#F97316] to-[#F59E0B]',
  leads: 'from-[#4338CA] to-[#6366F1]',
  occupancy: 'from-[#1E293B] to-[#334155]',
  returns: 'from-[#DC2626] to-[#EF4444]',
};

const SUMMARY_TITLES = {
  requests: 'Количество заявок',
  paidRequests: 'Количество оплаченных заявок',
  salesTotal: 'Общая сумма продаж',
  leads: 'Количество лидов',
  occupancy: 'Заполняемость складов',
  returns: 'Возвраты и расторжения',
};

const formatNumber = (value) => new Intl.NumberFormat('ru-RU').format(Math.round(value));

const formatCurrency = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatDateShort = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Сокращенный формат для отображения на диаграмме
const formatCompactNumber = (value) => {
  const num = Math.round(value);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  }
  return num.toString();
};

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'L', x, y, 'Z'].join(' ');
};

const computeHash = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const adjustValue = (baseValue, filters, seedSuffix, scale = 0.12) => {
  const modifiers = Object.entries(filters)
    .filter(([key]) => key !== 'period')
    .map(([, val]) => val)
    .filter((val) => val !== 'all');

  if (!modifiers.length) {
    return baseValue;
  }

  const hashSeed = `${filters.period}|${seedSuffix}|${modifiers.join('|')}`;
  const hash = computeHash(hashSeed);
  const normalized = (((hash % 2000) + 2000) % 2000) / 2000; // 0..1
  const factor = 1 + (normalized * 2 - 1) * scale;
  const adjusted = baseValue * factor;

  if (baseValue < 1) {
    return Math.min(0.98, Math.max(0.05, adjusted));
  }

  return Math.max(0, adjusted);
};

const useStatisticsData = (filters) => {
  // Запросы к API
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['statistics', 'summary', filters],
    queryFn: () => statisticsApi.getSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });

  const { data: lineChartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['statistics', 'line-chart', filters],
    queryFn: () => statisticsApi.getLineChartData(filters),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: leadSourcesData, isLoading: isLeadSourcesLoading } = useQuery({
    queryKey: ['statistics', 'lead-sources', filters],
    queryFn: () => statisticsApi.getLeadSources(filters),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: cancelReasonsData, isLoading: isCancelReasonsLoading } = useQuery({
    queryKey: ['statistics', 'cancel-reasons', filters],
    queryFn: () => statisticsApi.getCancelReasons(filters),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return useMemo(() => {
    const isLoading =
      isSummaryLoading || isChartLoading || isLeadSourcesLoading || isCancelReasonsLoading;

    // Если данные загружаются, возвращаем пустые данные
    if (isLoading || !summaryData || !lineChartData || !leadSourcesData || !cancelReasonsData) {
      return {
        summary: [],
        lineChartData: { labels: [], datasets: [] },
        leadSources: [],
        cancelReasons: [],
        cancelReasonComments: [],
        tableRows: [],
        isLoading: true,
      };
    }

    // Форматируем сводную статистику
    const summary = Object.entries(SUMMARY_TITLES).map(([key, title]) => {
      let value;
      let rawValue;

      if (key === 'salesTotal') {
        rawValue = summaryData.salesTotal || 0;
        value = formatCurrency(rawValue);
      } else if (key === 'occupancy') {
        rawValue = summaryData.occupancy || 0;
        value = `${rawValue}%`;
      } else {
        rawValue = summaryData[key] || 0;
        value = formatNumber(rawValue);
      }

      return {
        key,
        title,
        value,
        rawValue,
      };
    });

    // Нормализуем источники лидов (преобразуем в проценты)
    const totalLeadValue = leadSourcesData.reduce((acc, item) => acc + (item.value || 0), 0);
    const normalizedLeadSources = totalLeadValue > 0
      ? leadSourcesData.map((item) => ({
      ...item,
          value: Math.round(((item.value || 0) / totalLeadValue) * 100),
        }))
      : leadSourcesData;

    // Корректируем округление, чтобы сумма равнялась 100
    const totalPercent = normalizedLeadSources.reduce((acc, item) => acc + item.value, 0);
    const diff = 100 - totalPercent;
    if (diff !== 0 && normalizedLeadSources.length > 0) {
      normalizedLeadSources[0].value += diff;
    }

    // Формируем данные для экспорта
    const period = filters.period || 'year';
    const cancelReasonsRaw = cancelReasonsData.reasons || [];
    const cancelReasonsTotal = cancelReasonsData.total || 0;
    const cancelReasons = cancelReasonsTotal > 0
      ? cancelReasonsRaw.map((item) => ({
          ...item,
          percent: Math.round((item.value / cancelReasonsTotal) * 100),
        }))
      : cancelReasonsRaw;

    const cancelReasonComments = cancelReasonsData.comments || [];

    const tableRows = [
      ['Показатель', 'Значение'],
      ...summary.map(({ title, value }) => [title, value]),
      [],
      ['Период', PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? period],
      [],
      ['Динамика', 'Заявки', 'Продажи'],
      ...(lineChartData.labels || []).map((label, idx) => [
        label,
        lineChartData.datasets?.[0]?.values?.[idx] || 0,
        formatCurrency(lineChartData.datasets?.[1]?.values?.[idx] || 0),
      ]),
      [],
      ['Источник лидов', 'Доля'],
      ...normalizedLeadSources.map((item) => [item.label, `${item.value}%`]),
      [],
      ['Причины отмен', 'Количество', 'Доля'],
      ...cancelReasons.map((item) => [item.label, formatNumber(item.value), `${item.percent || 0}%`]),
    ];

    return {
      summary,
      lineChartData: lineChartData || { labels: [], datasets: [] },
      leadSources: normalizedLeadSources,
      cancelReasons,
      cancelReasonComments,
      tableRows,
      isLoading: false,
    };
  }, [
    summaryData,
    lineChartData,
    leadSourcesData,
    cancelReasonsData,
    filters,
    isSummaryLoading,
    isChartLoading,
    isLeadSourcesLoading,
    isCancelReasonsLoading,
  ]);
};

const SummaryCard = ({ title, value, styleKey }) => (
  <div
    className={clsx(
      'rounded-2xl px-6 py-5 text-white shadow-lg transition-transform duration-200 hover:-translate-y-1',
      'bg-gradient-to-r',
      CARD_STYLES[styleKey] ?? 'from-slate-600 to-slate-700',
    )}
  >
    <p className="text-sm uppercase tracking-wide text-slate-200/80">{title}</p>
    <p className="mt-3 text-3xl font-semibold">{value}</p>
  </div>
);

const LineChart = ({ data }) => {
  const width = 640;
  const height = 260;
  const margin = { top: 20, right: 24, bottom: 40, left: 48 };
  const maxValue = Math.max(
    ...data.datasets.flatMap((dataset) => dataset.values),
    10,
  );
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = width - margin.left - margin.right;
  const yTicks = 4;

  const getPoint = (value, index, total) => {
    if (total <= 1) {
      return {
        x: margin.left,
        y: margin.top + chartHeight - (value / maxValue) * chartHeight,
      };
    }

    return {
      x: margin.left + (index / (total - 1)) * chartWidth,
      y: margin.top + chartHeight - (value / maxValue) * chartHeight,
    };
  };

  const buildPath = (values) =>
    values
      .map((value, idx) => {
        const point = getPoint(value, idx, values.length);
        return `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
      {/* Axes */}
      <line
        x1={margin.left}
        y1={margin.top + chartHeight}
        x2={margin.left + chartWidth}
        y2={margin.top + chartHeight}
        stroke="#CBD5F5"
        strokeWidth="1"
      />
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={margin.top + chartHeight}
        stroke="#CBD5F5"
        strokeWidth="1"
      />

      {/* Grid lines */}
      {Array.from({ length: yTicks + 1 }).map((_, idx) => {
        const y = margin.top + (idx / yTicks) * chartHeight;
        const value = Math.round(maxValue - (idx / yTicks) * maxValue);
        // Форматируем ось Y, если есть датасет "Продажи" (обычно это второй датасет с большими значениями)
        const hasSalesDataset = data.datasets.some(d => d.name === 'Продажи');
        // Используем сокращенный формат для оси Y, чтобы значения помещались
        const displayValue = hasSalesDataset && maxValue > 1000 ? formatCompactNumber(value) : value;
        return (
          <g key={`grid-${idx}`}>
            <line
              x1={margin.left}
              y1={y}
              x2={margin.left + chartWidth}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth={idx === yTicks ? 1.2 : 0.8}
              strokeDasharray={idx === yTicks ? '0' : '6 6'}
            />
            <text
              x={margin.left - 12}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#475569"
            >
              {displayValue}
            </text>
          </g>
        );
      })}

      {/* Paths and points */}
      {data.datasets.map((dataset, datasetIdx) => (
        <g key={dataset.name}>
          <path
            d={buildPath(dataset.values)}
            fill="none"
            stroke={dataset.color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {dataset.values.map((value, idx) => {
            const point = getPoint(value, idx, dataset.values.length);
            // Для продаж (второй датасет) используем сокращенный формат для компактности
            // В экспорте будет полная сумма
            const displayValue = datasetIdx === 1 && value > 0 ? formatCompactNumber(value) : value;
            return (
              <g key={`${dataset.name}-${idx}`}>
                <circle cx={point.x} cy={point.y} r="4.5" fill="#fff" stroke={dataset.color} strokeWidth="2.5" />
                <text
                  x={point.x}
                  y={point.y - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill={dataset.color}
                >
                  {displayValue}
                </text>
              </g>
            );
          })}
        </g>
      ))}

      {/* X-axis labels */}
      {data.labels.map((label, idx) => {
        const point = getPoint(0, idx, data.labels.length);
        return (
          <text
            key={label}
            x={point.x}
            y={margin.top + chartHeight + 24}
            textAnchor="middle"
            fontSize="12"
            fill="#475569"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

const PieChart = ({ data, highlightedKey }) => {
  const size = 280;
  const radius = size / 2 - 12;
  const center = size / 2;
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let startAngle = 0;

  const slices = data.map((item) => {
    const angle = (item.value / total) * 360;
    const endAngle = startAngle + angle;
    const path = describeArc(center, center, radius, startAngle, endAngle);
    const midAngle = startAngle + angle / 2;
    startAngle = endAngle;

    const labelPoint = polarToCartesian(center, center, radius * 0.6, midAngle);
    return {
      ...item,
      path,
      labelPoint,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-72">
      <circle cx={center} cy={center} r={radius} fill="#F8FAFC" />
      {slices.map((slice) => (
        <path
          key={slice.label}
          d={slice.path}
          fill={slice.color}
          opacity={highlightedKey === 'all' || highlightedKey === slice.key ? 0.95 : 0.65}
        />
      ))}
      <circle cx={center} cy={center} r={radius * 0.45} fill="white" />
      <text x={center} y={center - 6} textAnchor="middle" fontSize="14" fill="#1E293B">
        Всего
      </text>
      <text x={center} y={center + 14} textAnchor="middle" fontSize="22" fontWeight="600" fill="#1E293B">
        {total}
      </text>
      {slices.map((slice) => (
        <text
          key={`${slice.label}-label`}
          x={slice.labelPoint.x}
          y={slice.labelPoint.y}
          textAnchor="middle"
          fontSize="12"
          fill="#0F172A"
        >
          {slice.value}%
        </text>
      ))}
    </svg>
  );
};

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-500">
    <span className="font-medium text-slate-600">{label}</span>
    <select
      value={value}
      onChange={onChange}
      className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 shadow-sm focus:border-[#273655] focus:outline-none focus:ring-2 focus:ring-[#273655]/20"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const InlineSelect = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 shadow-sm focus:border-[#273655] focus:outline-none focus:ring-2 focus:ring-[#273655]/20"
  >
    {placeholder ? (
      <option value="all" hidden>
        {placeholder}
      </option>
    ) : null}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const Statistics = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState('requests');
  const [requestsSearch, setRequestsSearch] = useState('');
  const [logsSearch, setLogsSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [logTypeFilter, setLogTypeFilter] = useState('all');
  const [requestsPage, setRequestsPage] = useState(1);

  const {
    summary,
    lineChartData,
    leadSources,
    cancelReasons,
    cancelReasonComments,
    tableRows,
    isLoading: isStatisticsLoading,
  } = useStatisticsData(filters);

  // Запрос заявок
  const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['statistics', 'requests', filters, requestsPage],
    queryFn: () => statisticsApi.getRequests(filters, requestsPage, 50),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  // Запрос логов действий
  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['statistics', 'action-logs', filters],
    queryFn: () => statisticsApi.getActionLogs(filters, 1, 50),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
  const filteredRequests = useMemo(() => {
    const requests = requestsData?.data || [];
    const normalizedSearch = requestsSearch.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesStatus =
        requestStatusFilter === 'all' ? true : item.status === requestStatusFilter;
      const statusLabel = STATUS_LABELS[item.status] ?? '';
      const matchesSearch =
        !normalizedSearch ||
        `${item.id}`.includes(normalizedSearch) ||
        item.client.toLowerCase().includes(normalizedSearch) ||
        item.warehouse.toLowerCase().includes(normalizedSearch) ||
        statusLabel.toLowerCase().includes(normalizedSearch) ||
        formatCurrency(item.amount).toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [requestsData, requestsSearch, requestStatusFilter]);

  const filteredLogs = useMemo(() => {
    const logs = logsData?.data || [];
    const normalizedSearch = logsSearch.trim().toLowerCase();
    return logs.filter((item) => {
      const matchesType = logTypeFilter === 'all' ? true : item.type === logTypeFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${item.id}`.includes(normalizedSearch) ||
        item.user?.toLowerCase().includes(normalizedSearch) ||
        item.action?.toLowerCase().includes(normalizedSearch) ||
        item.target?.toLowerCase().includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [logsData, logsSearch, logTypeFilter]);

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    console.log('Filter change:', field, 'value:', value);
    setFilters((prev) => {
      const newFilters = {
      ...prev,
      [field]: value,
      };
      console.log('New filters:', newFilters);
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const exportToExcel = () => {
    const csvRows = tableRows.map((row) => row.map((cell) => `"${cell ?? ''}"`).join(';'));
    const blob = new Blob([`\uFEFF${csvRows.join('\n')}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistics_${filters.period}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToPdf = () => {
    const printable = window.open('', '_blank');
    if (!printable) {
      return;
    }

    const summaryRows = summary
      .map(
        (item) =>
          `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;">${item.title}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:600;">${item.value}</td></tr>`,
      )
      .join('');

    const dynamicsHeader = `<tr><th style="padding:8px 12px;border:1px solid #e2e8f0;background:#f1f5f9;">Период</th><th style="padding:8px 12px;border:1px solid #e2e8f0;background:#f1f5f9;">Заявки</th><th style="padding:8px 12px;border:1px solid #e2e8f0;background:#f1f5f9;">Продажи</th></tr>`;

    const dynamicsRows = lineChartData.labels
      .map(
        (label, idx) =>
          `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">${label}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:right;">${lineChartData.datasets[0].values[idx]}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(lineChartData.datasets[1].values[idx] || 0)}</td></tr>`,
      )
      .join('');

    const leadRows = leadSources
      .map(
        (item) =>
          `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">${item.label}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:right;">${item.value}%</td></tr>`,
      )
      .join('');

    printable.document.write(`
      <html>
        <head>
          <title>Отчёт по статистике</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #0f172a; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .badge { display:inline-block; padding:6px 10px; background:#eef2ff; color:#3730a3; border-radius:999px; font-size:12px; margin-top:4px; }
          </style>
        </head>
        <body>
          <h1>Отчёт по статистике</h1>
          <div>Сформировано: ${new Date().toLocaleString('ru-RU')}</div>
          <div class="badge">Период: ${PERIOD_OPTIONS.find((option) => option.value === filters.period)?.label ?? filters.period}</div>
          <h2>Ключевые показатели</h2>
          <table>${summaryRows}</table>
          <h2>Динамика заявок и продаж</h2>
          <table>${dynamicsHeader}${dynamicsRows}</table>
          <h2>Источники лидов</h2>
          <table>${leadRows}</table>
        </body>
      </html>
    `);

    printable.document.close();
    printable.focus();
    printable.print();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Статистика и аналитика</h1>
              <p className="text-sm text-slate-500">
                Анализируйте заявки, продажи, лиды и заполняемость складов по выбранным фильтрам.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportToExcel}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#273655] hover:text-[#273655]"
              >
                Экспорт в Excel
              </button>
              <button
                type="button"
                onClick={exportToPdf}
                className="rounded-xl bg-[#273655] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1b2740]"
              >
                Экспорт в PDF
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            <FilterSelect
              label="Период"
              value={filters.period}
              onChange={handleFilterChange('period')}
              options={PERIOD_OPTIONS}
            />
            <FilterSelect
              label="Склад"
              value={filters.warehouse}
              onChange={handleFilterChange('warehouse')}
              options={WAREHOUSE_OPTIONS}
            />
            <FilterSelect
              label="Тип хранения"
              value={filters.storageType}
              onChange={handleFilterChange('storageType')}
              options={STORAGE_TYPE_OPTIONS}
            />
            <FilterSelect
              label="Статус заявки"
              value={filters.applicationStatus}
              onChange={handleFilterChange('applicationStatus')}
              options={APPLICATION_STATUS_OPTIONS}
            />
            <FilterSelect
              label="Оплата"
              value={filters.paymentStatus}
              onChange={handleFilterChange('paymentStatus')}
              options={PAYMENT_STATUS_OPTIONS}
            />
            <FilterSelect
              label="Контракт"
              value={filters.contractStatus}
              onChange={handleFilterChange('contractStatus')}
              options={CONTRACT_STATUS_OPTIONS}
            />
            <FilterSelect
              label="Источник лида"
              value={filters.leadSource}
              onChange={handleFilterChange('leadSource')}
              options={LEAD_SOURCE_OPTIONS}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(filters)
              .filter(([key, value]) => key !== 'period' && value !== 'all')
              .map(([key, value]) => {
                const optionMap = {
                  warehouse: WAREHOUSE_OPTIONS,
                  storageType: STORAGE_TYPE_OPTIONS,
                  applicationStatus: APPLICATION_STATUS_OPTIONS,
                  paymentStatus: PAYMENT_STATUS_OPTIONS,
                  contractStatus: CONTRACT_STATUS_OPTIONS,
                  leadSource: LEAD_SOURCE_OPTIONS,
                };

                const currentOption = optionMap[key]?.find((item) => item.value === value);

                if (!currentOption) {
                  return null;
                }

                return (
                  <span
                    key={`${key}-${value}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-medium text-[#4338ca]"
                  >
                    {currentOption.label}
                    <button
                      type="button"
                      className="text-[#4338ca]/70 hover:text-[#4338ca]"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          [key]: 'all',
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm font-medium text-[#273655] hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {isStatisticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">Загрузка статистики...</div>
        </div>
      ) : (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {summary.map((card) => (
          <SummaryCard key={card.key} title={card.title} value={card.value} styleKey={card.key} />
        ))}
      </div>
      )}

      {isStatisticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">Загрузка графиков...</div>
        </div>
      ) : (
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Заявки и продажи</h2>
            <p className="text-sm text-slate-500">
              Динамика заявок и оплаченных продаж по выбранному периоду.
            </p>
          </div>
            {lineChartData.labels && lineChartData.labels.length > 0 ? (
              <>
          <div className="rounded-2xl bg-slate-50 p-4">
            <LineChart data={lineChartData} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
                  {lineChartData.datasets?.map((dataset) => (
              <div key={dataset.name} className="flex items-center gap-2 text-sm text-slate-600">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: dataset.color }}
                />
                {dataset.name}
              </div>
            ))}
          </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">Нет данных для отображения</div>
            )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Источники лидов</h2>
            <p className="text-sm text-slate-500">
              Распределение лидов по каналам привлечения за выбранный период.
            </p>
          </div>
            {leadSources && leadSources.length > 0 ? (
              <>
          <PieChart data={leadSources} highlightedKey={filters.leadSource} />
          <div className="mt-4 space-y-2">
            {leadSources.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </div>
                <span className="font-medium text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">Нет данных для отображения</div>
            )}
        </div>
      </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-2 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Причины отмен (лиды оттока)</h2>
            <p className="text-sm text-slate-500">
              Фиксируем ответы пользователей при отмене договора, чтобы понимать основные причины ухода.
            </p>
          </div>
          {cancelReasons && cancelReasons.length > 0 ? (
            <>
              <div className="space-y-4">
                {cancelReasons.map((reason) => (
                  <div key={reason.key}>
                    <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                      <span className="pr-4 text-slate-700">{reason.label}</span>
                      <span className="text-slate-900">
                        {formatNumber(reason.value)} · {reason.percent || 0}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-rose-500 transition-all"
                        style={{ width: `${Math.max(reason.percent || 0, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {cancelReasonComments && cancelReasonComments.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Комментарии клиентов</h3>
                  {cancelReasonComments.map((comment) => (
                    <div key={`${comment.orderId}-${comment.date}`} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-700">{comment.comment}</p>
                      <span className="mt-2 block text-xs text-slate-400">
                        Заказ #{comment.orderId} · {formatDateShort(comment.date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center text-slate-500">Нет данных об отменах для выбранных фильтров</div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 rounded-xl bg-slate-100/70 p-1">
              {[
                { key: 'requests', label: 'Заявки' },
                { key: 'logs', label: 'Логи действий' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeTab === tab.key ? 'bg-white text-[#273655] shadow-sm' : 'text-slate-500',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'requests' ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <InlineSelect
                  value={requestStatusFilter}
                  onChange={(event) => setRequestStatusFilter(event.target.value)}
                  options={REQUEST_STATUS_OPTIONS}
                />
                <div className="relative">
                  <input
                    type="search"
                    value={requestsSearch}
                    onChange={(event) => setRequestsSearch(event.target.value)}
                    placeholder="Поиск по заявкам..."
                    className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-[#273655] focus:outline-none focus:ring-2 focus:ring-[#273655]/20 sm:w-64"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15 15-3.5-3.5m1.5-2.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <InlineSelect
                  value={logTypeFilter}
                  onChange={(event) => setLogTypeFilter(event.target.value)}
                  options={ACTION_TYPE_OPTIONS}
                />
                <div className="relative">
                  <input
                    type="search"
                    value={logsSearch}
                    onChange={(event) => setLogsSearch(event.target.value)}
                    placeholder="Поиск по действиям..."
                    className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-[#273655] focus:outline-none focus:ring-2 focus:ring-[#273655]/20 sm:w-64"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15 15-3.5-3.5m1.5-2.5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {activeTab === 'requests' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Клиент</th>
                    <th className="px-4 py-3 font-medium">Склад</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isRequestsLoading ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={5}>
                        Загрузка заявок...
                      </td>
                    </tr>
                  ) : filteredRequests.length ? (
                    filteredRequests.map((item) => (
                      <tr key={item.id} className="text-slate-700">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.id}</td>
                        <td className="px-4 py-3">{item.client}</td>
                        <td className="px-4 py-3">{item.warehouse}</td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                              STATUS_BADGE_STYLES[item.status] ?? 'bg-slate-100 text-slate-600',
                            )}
                          >
                            {STATUS_LABELS[item.status] ?? item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={5}>
                        Нет заявок, подходящих по текущим фильтрам
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Сотрудник</th>
                    <th className="px-4 py-3 font-medium">Действие</th>
                    <th className="px-4 py-3 font-medium">Объект</th>
                    <th className="px-4 py-3 font-medium text-right">Дата и время</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLogsLoading ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={5}>
                        Загрузка логов...
                      </td>
                    </tr>
                  ) : filteredLogs.length ? (
                    filteredLogs.map((item) => (
                      <tr key={item.id} className="text-slate-700">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.id}</td>
                        <td className="px-4 py-3">{item.user}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900">{item.action}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.target}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{item.datetime}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={5}>
                        Нет событий, подходящих по текущим фильтрам
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;

