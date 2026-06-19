import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Phone,
  RefreshCw,
  Search,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Download,
  Plus,
} from 'lucide-react';
import { lpLeadsApi } from '@/shared/api/lpLeadsApi.js';
import {
  getClientTypeLabel,
  getLeadSourceDisplayLabel,
  getServiceDisplayLabel,
} from '@/shared/constants/manualLpLead.js';
import { formatCalendarDateTime } from '@/shared/lib/utils/date.js';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast.js';
import LpLeadModal from './LpLeadModal.jsx';
import CreateManualLeadModal from './CreateManualLeadModal.jsx';
import { FormSelect, getFormInputClass } from '@/shared/ui/FormSelect.jsx';
import { DateField } from '@/shared/ui/DateField.jsx';

const LP_INPUT_CLASS = getFormInputClass('account');
import {
  ACTUAL_INTEREST_FILTER_OPTIONS,
  LEAD_OUTCOME_FILTER_OPTIONS,
  LEAD_QUALITY_FILTER_OPTIONS,
  LEAD_STATUS_FILTER_OPTIONS,
  PROCESSING_FILTER_OPTIONS,
  PROCESSING_STATE_LABELS,
  REJECTION_REASON_FILTER_OPTIONS,
  getActionButtonLabel,
  getFieldLabel,
  processingStateBadgeClass,
} from '@/shared/constants/lpLeadProcessing.js';

const SERVICE_LABELS = {
  individual: 'LP-1 · Аренда бокса',
  camera: 'LP-2 · Камера хранения',
  cloud: 'LP-3 · Облачное хранение',
};

const SERVICE_FILTER_OPTIONS = [
  { value: '', label: 'Все услуги' },
  { value: 'individual', label: SERVICE_LABELS.individual },
  { value: 'camera', label: SERVICE_LABELS.camera },
  { value: 'cloud', label: SERVICE_LABELS.cloud },
  { value: 'undecided', label: 'Не определился' },
  { value: 'other', label: 'Другое' },
];

const CLIENT_FILTER_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatSubmittedAt(value) {
  if (!value) return '—';
  const s = formatCalendarDateTime(value);
  return s || String(value);
}

function getTableActionButtonLabel(processingState) {
  switch (processingState) {
    case 'unprocessed':
      return 'Обработать';
    case 'has_data':
      return 'Изменить';
    case 'closed':
      return 'Открыть';
    default:
      return 'Открыть';
  }
}

/* eslint-disable react/prop-types */
function TruncatedText({ children, className = '', title }) {
  const text = children ?? '—';
  const tooltip = title ?? (typeof text === 'string' && text !== '—' ? text : undefined);
  return (
    <span className={`block truncate ${className}`} title={tooltip}>
      {text}
    </span>
  );
}
/* eslint-enable react/prop-types */

function phoneToTelHref(phone) {
  if (!phone) return '#';
  const d = String(phone).replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('7')) return `tel:+${d}`;
  if (d.length === 11 && d.startsWith('8')) return `tel:+7${d.slice(1)}`;
  if (d.length === 10) return `tel:+7${d}`;
  return `tel:${phone}`;
}

function rowKey(row) {
  return row.id != null ? String(row.id) : `${row.phone}-${row.submitted_at}`;
}

/* eslint-disable react/prop-types */
function GclidCell({ value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showSuccessToast('GCLID скопирован');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showErrorToast('Не удалось скопировать GCLID');
    }
  }, [value]);

  if (!value) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const head = value.slice(0, 10);
  const tail = value.length > 14 ? `…${value.slice(-4)}` : '';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={value}
      className="inline-flex max-w-full items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-[#273655] transition hover:border-[#31876D]/40 hover:bg-[#31876D]/5"
    >
      <span className="truncate max-w-[4.5rem]">
        {head}
        {tail}
      </span>
      {copied ? (
        <Check className="w-3.5 h-3.5 shrink-0 text-[#31876D]" aria-hidden />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden />
      )}
    </button>
  );
}

function ProcessingBadge({ state, compact = false }) {
  const label = PROCESSING_STATE_LABELS[state] || state || '—';
  return (
    <span
      className={`inline-flex max-w-full rounded-lg border font-medium ${
        compact ? 'px-1.5 py-0.5 text-[10px] leading-tight' : 'px-2 py-0.5 text-xs'
      } ${processingStateBadgeClass(state)}`}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
/* eslint-enable react/prop-types */

function buildListParams(filters, page, pageSize) {
  const params = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
  if (filters.service_type) params.service_type = filters.service_type;
  if (filters.client_type) params.client_type = filters.client_type;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.q) params.q = filters.q;
  if (filters.processing_state) params.processing_state = filters.processing_state;
  if (filters.lead_status) params.lead_status = filters.lead_status;
  if (filters.lead_quality) params.lead_quality = filters.lead_quality;
  if (filters.actual_interest) params.actual_interest = filters.actual_interest;
  if (filters.lead_outcome) params.lead_outcome = filters.lead_outcome;
  if (filters.rejection_reason) params.rejection_reason = filters.rejection_reason;
  return params;
}

function LpLeadsSection() {
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterProcessing, setFilterProcessing] = useState('');
  const [filterLeadStatus, setFilterLeadStatus] = useState('');
  const [filterLeadQuality, setFilterLeadQuality] = useState('');
  const [filterActualInterest, setFilterActualInterest] = useState('');
  const [filterLeadOutcome, setFilterLeadOutcome] = useState('');
  const [filterRejectionReason, setFilterRejectionReason] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const filters = useMemo(
    () => ({
      service_type: filterService,
      client_type: filterClient,
      date_from: filterDateFrom,
      date_to: filterDateTo,
      q: search.trim() || undefined,
      processing_state: filterProcessing,
      lead_status: filterLeadStatus,
      lead_quality: filterLeadQuality,
      actual_interest: filterActualInterest,
      lead_outcome: filterLeadOutcome,
      rejection_reason: filterRejectionReason,
    }),
    [
      filterService,
      filterClient,
      filterDateFrom,
      filterDateTo,
      search,
      filterProcessing,
      filterLeadStatus,
      filterLeadQuality,
      filterActualInterest,
      filterLeadOutcome,
      filterRejectionReason,
    ],
  );

  const listParams = useMemo(
    () => buildListParams(filters, page, pageSize),
    [filters, page, pageSize],
  );

  const listQueryKey = useMemo(() => ['lp-landing-leads', listParams], [listParams]);

  useEffect(() => {
    setPage(1);
  }, [
    filterService,
    filterClient,
    filterDateFrom,
    filterDateTo,
    search,
    pageSize,
    filterProcessing,
    filterLeadStatus,
    filterLeadQuality,
    filterActualInterest,
    filterLeadOutcome,
    filterRejectionReason,
  ]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => lpLeadsApi.getLandingPageLeads(listParams),
    staleTime: 30 * 1000,
  });

  const pageRows = data?.items ?? [];
  const totalFiltered = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);
  const pageOffset = (safePage - 1) * pageSize;
  const rangeFrom = totalFiltered === 0 ? 0 : pageOffset + 1;
  const rangeTo = Math.min(pageOffset + pageSize, totalFiltered);

  const goPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  const openLead = (row, e) => {
    if (e?.target?.closest?.('button, a')) return;
    if (row.id == null) return;
    setSelectedLeadId(row.id);
    setModalOpen(true);
  };

  const openLeadByButton = (row, e) => {
    e.stopPropagation();
    if (row.id == null) return;
    setSelectedLeadId(row.id);
    setModalOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { limit, offset, ...exportParams } = listParams;
      await lpLeadsApi.exportLandingPageLeads(exportParams);
      showSuccessToast('Экспорт загружен');
    } catch (err) {
      showErrorToast(err?.response?.data?.message || err?.message || 'Не удалось экспортировать');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setFilterService('');
    setFilterClient('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearch('');
    setFilterProcessing('');
    setFilterLeadStatus('');
    setFilterLeadQuality('');
    setFilterActualInterest('');
    setFilterLeadOutcome('');
    setFilterRejectionReason('');
  };

  const hasActiveFilters =
    filterService ||
    filterClient ||
    filterDateFrom ||
    filterDateTo ||
    search ||
    filterProcessing ||
    filterLeadStatus ||
    filterLeadQuality ||
    filterActualInterest ||
    filterLeadOutcome ||
    filterRejectionReason;

  const filterSelect = (label, value, onChange, options) => (
    <FormSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Все"
      variant="account"
    />
  );

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202422] flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-[#31876D]" aria-hidden />
            CRM
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Контакты с форм LP-1, LP-2 и LP-3. Обработка лидов, фильтры и экспорт для анализа рекламы.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#31876D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2a735c]"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Добавить лид вручную
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-[#273655] hover:bg-gray-50 disabled:opacity-60"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} aria-hidden />
            Экспорт CSV
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-[#273655] hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden />
            Обновить
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filterSelect('Услуга (LP)', filterService, setFilterService, SERVICE_FILTER_OPTIONS)}
          {filterSelect('Тип клиента', filterClient, setFilterClient, CLIENT_FILTER_OPTIONS)}
          {filterSelect('Обработка', filterProcessing, setFilterProcessing, PROCESSING_FILTER_OPTIONS)}
          {filterSelect('Статус лида', filterLeadStatus, setFilterLeadStatus, LEAD_STATUS_FILTER_OPTIONS)}
          {filterSelect('Качество лида', filterLeadQuality, setFilterLeadQuality, LEAD_QUALITY_FILTER_OPTIONS)}
          {filterSelect(
            'Фактический интерес',
            filterActualInterest,
            setFilterActualInterest,
            ACTUAL_INTEREST_FILTER_OPTIONS,
          )}
          {filterSelect('Итог лида', filterLeadOutcome, setFilterLeadOutcome, LEAD_OUTCOME_FILTER_OPTIONS)}
          {filterSelect(
            'Причина отказа',
            filterRejectionReason,
            setFilterRejectionReason,
            REJECTION_REASON_FILTER_OPTIONS,
          )}
          <FormSelect
            label="На странице"
            value={String(pageSize)}
            onChange={(v) => setPageSize(Number(v))}
            options={PAGE_SIZE_OPTIONS.map((n) => ({
              value: String(n),
              label: `${n} записей`,
            }))}
            variant="account"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DateField
            label="Дата с"
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            variant="account"
            allowFutureDates
          />
          <DateField
            label="Дата по"
            value={filterDateTo}
            onChange={setFilterDateTo}
            variant="account"
            allowFutureDates
          />
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-medium text-gray-600">Поиск</span>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 z-10 w-4 h-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Имя, телефон, секция…"
                className={`${LP_INPUT_CLASS} w-full pl-10`}
              />
            </div>
          </label>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-[#31876D] hover:underline"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {isError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-4">
          <p className="font-semibold">Не удалось загрузить заявки</p>
          <p className="mt-1 text-amber-800">
            {error?.response?.status === 404 || error?.response?.status === 501
              ? 'На сервере нужен метод GET /leads/landing-pages (и миграция 108 для полей обработки).'
              : error?.response?.data?.message ||
                error?.message ||
                'Проверьте доступ или попробуйте позже.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && totalFiltered > 0 && (
        <p className="text-sm text-gray-600 mb-3">
          Найдено: <span className="font-semibold text-[#273655]">{totalFiltered}</span>
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-500 text-sm">Загрузка…</div>
      ) : totalFiltered === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500 text-sm">
          {!isError
            ? 'Пока нет заявок с лендингов или нет записей по выбранным фильтрам.'
            : null}
        </div>
      ) : (
        <>
          <div className="hidden md:block w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full table-fixed text-left text-xs">
              <colgroup>
                <col className="w-[9%]" />
                <col className="w-[11%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight">Имя</th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight">Телефон</th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight" title="Источник лида">
                    Источник
                  </th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight">Обработка</th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight" title="Статус лида">
                    Статус
                  </th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight" title="Ответственный менеджер">
                    Менеджер
                  </th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight" title="Услуга, тип клиента и секция">
                    Услуга
                  </th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight">GCLID</th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight">Дата</th>
                  <th className="px-2 lg:px-3 py-2.5 font-semibold leading-tight">
                    <span className="sr-only">Действие</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((row) => {
                  const serviceLabel = getServiceDisplayLabel(row);
                  const leadStatusLabel = getFieldLabel('lead_status', row.lead_status);
                  const clientTypePart = row.client_type ? getClientTypeLabel(row.client_type) : null;
                  const serviceMeta = [clientTypePart, row.page_section].filter(Boolean).join(' · ');

                  return (
                    <tr
                      key={rowKey(row)}
                      className="hover:bg-gray-50/80 cursor-pointer"
                      onClick={(e) => openLead(row, e)}
                    >
                      <td className="px-2 lg:px-3 py-2.5">
                        <TruncatedText className="font-medium text-gray-900">{row.name || '—'}</TruncatedText>
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <a
                          href={phoneToTelHref(row.phone)}
                          onClick={(e) => e.stopPropagation()}
                          className="block truncate font-mono text-[#31876D] font-semibold hover:underline"
                          title={row.phone || undefined}
                        >
                          {row.phone || '—'}
                        </a>
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <TruncatedText className="text-gray-700 font-medium">
                          {getLeadSourceDisplayLabel(row)}
                        </TruncatedText>
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <ProcessingBadge state={row.processing_state} compact />
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <TruncatedText className="text-gray-700" title={leadStatusLabel}>
                          {leadStatusLabel}
                        </TruncatedText>
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <TruncatedText className="text-gray-700" title={row.responsible_manager_name || undefined}>
                          {row.responsible_manager_name || '—'}
                        </TruncatedText>
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <TruncatedText className="text-gray-700 font-medium" title={serviceLabel}>
                          {serviceLabel}
                        </TruncatedText>
                        {serviceMeta ? (
                          <TruncatedText className="text-[10px] text-gray-500 mt-0.5" title={serviceMeta}>
                            {serviceMeta}
                          </TruncatedText>
                        ) : null}
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <GclidCell value={row.gclid} />
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <TruncatedText className="text-gray-600" title={formatSubmittedAt(row.submitted_at)}>
                          {formatSubmittedAt(row.submitted_at)}
                        </TruncatedText>
                      </td>
                      <td className="px-2 lg:px-3 py-2.5">
                        <button
                          type="button"
                          onClick={(e) => openLeadByButton(row, e)}
                          className="w-full rounded-lg border border-[#31876D]/30 bg-[#31876D]/5 px-2 py-1.5 text-[11px] font-semibold leading-tight text-[#31876D] hover:bg-[#31876D]/10"
                        >
                          {getTableActionButtonLabel(row.processing_state)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-3">
            {pageRows.map((row) => (
              <li
                key={rowKey(row)}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer"
                onClick={(e) => openLead(row, e)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{row.name || '—'}</p>
                    <p className="text-xs font-medium text-[#273655] mt-0.5">
                      {getLeadSourceDisplayLabel(row)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <ProcessingBadge state={row.processing_state} />
                      <span className="text-xs text-gray-600">
                        {getFieldLabel('lead_status', row.lead_status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{getServiceDisplayLabel(row)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Тип: {getClientTypeLabel(row.client_type)} · Менеджер:{' '}
                      {row.responsible_manager_name || '—'}
                    </p>
                  </div>
                  <a
                    href={phoneToTelHref(row.phone)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#31876D] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden />
                    Позвонить
                  </a>
                </div>
                <p className="font-mono text-sm text-[#31876D] mt-2">{row.phone || '—'}</p>
                <button
                  type="button"
                  onClick={(e) => openLeadByButton(row, e)}
                  className="mt-3 w-full rounded-lg border border-[#31876D]/30 bg-[#31876D]/5 px-3 py-2 text-xs font-semibold text-[#31876D]"
                >
                  {getActionButtonLabel(row.processing_state)}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Показано{' '}
              <span className="font-medium text-[#273655]">
                {rangeFrom}–{rangeTo}
              </span>{' '}
              из {totalFiltered}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => goPage(safePage - 1)}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#273655] hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
                Назад
              </button>
              <span className="text-sm text-gray-600 px-2">
                Страница {safePage} из {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#273655] hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                Вперёд
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}

      <CreateManualLeadModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={(id) => {
          if (id != null) {
            setSelectedLeadId(id);
            setModalOpen(true);
          }
        }}
      />

      <LpLeadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        leadId={selectedLeadId}
        listQueryKey={listQueryKey}
      />
    </div>
  );
}

export default LpLeadsSection;
