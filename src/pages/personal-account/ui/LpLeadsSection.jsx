import React, { useMemo, useState, useEffect, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, RefreshCw, Search, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { lpLeadsApi } from '@/shared/api/lpLeadsApi.js';
import { formatCalendarDateTime } from '@/shared/lib/utils/date.js';

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
];

const CLIENT_FILTER_OPTIONS = [
  { value: '', label: 'Все клиенты' },
  { value: 'b2c', label: 'B2C (дом)' },
  { value: 'b2b', label: 'B2B (бизнес)' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatSubmittedAt(value) {
  if (!value) return '—';
  const s = formatCalendarDateTime(value);
  return s || String(value);
}

function phoneToTelHref(phone) {
  if (!phone) return '#';
  const d = String(phone).replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('7')) return `tel:+${d}`;
  if (d.length === 11 && d.startsWith('8')) return `tel:+7${d.slice(1)}`;
  if (d.length === 10) return `tel:+7${d}`;
  return `tel:${phone}`;
}

/** Начало дня по локальной дате из input type=date (YYYY-MM-DD) */
function startOfLocalDay(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function endOfLocalDay(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function rowKey(row) {
  return row.id != null ? String(row.id) : `${row.phone}-${row.submitted_at}`;
}

function LpLeadsSection() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const [filterService, setFilterService] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setPage(1);
  }, [filterService, filterClient, filterDateFrom, filterDateTo, deferredSearch, pageSize]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['lp-landing-leads'],
    queryFn: () => lpLeadsApi.getLandingPageLeads({ limit: 5000 }),
    staleTime: 30 * 1000,
  });

  const allItems = data?.items ?? [];

  const filtered = useMemo(() => {
    const fromTs = startOfLocalDay(filterDateFrom)?.getTime() ?? null;
    const toTs = endOfLocalDay(filterDateTo)?.getTime() ?? null;

    return allItems.filter((row) => {
      if (filterService && row.service_type !== filterService) return false;
      if (filterClient && String(row.client_type || '') !== filterClient) return false;
      if (fromTs != null || toTs != null) {
        const t = new Date(row.submitted_at).getTime();
        if (Number.isNaN(t)) return false;
        if (fromTs != null && t < fromTs) return false;
        if (toTs != null && t > toTs) return false;
      }
      if (deferredSearch) {
        const name = String(row.name || '').toLowerCase();
        const phone = String(row.phone || '').toLowerCase();
        const section = String(row.page_section || '').toLowerCase();
        const st = String(row.service_type || '').toLowerCase();
        if (
          !name.includes(deferredSearch) &&
          !phone.includes(deferredSearch) &&
          !section.includes(deferredSearch) &&
          !st.includes(deferredSearch)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    allItems,
    filterService,
    filterClient,
    filterDateFrom,
    filterDateTo,
    deferredSearch,
  ]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);
  const pageOffset = (safePage - 1) * pageSize;
  const pageRows = useMemo(
    () => filtered.slice(pageOffset, pageOffset + pageSize),
    [filtered, pageOffset, pageSize],
  );

  const rangeFrom = totalFiltered === 0 ? 0 : pageOffset + 1;
  const rangeTo = Math.min(pageOffset + pageSize, totalFiltered);

  const goPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  const selectClass =
    'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#273655] focus:border-[#31876D] focus:outline-none focus:ring-2 focus:ring-[#31876D]/20 min-w-0';

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202422] flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-[#31876D]" aria-hidden />
            Заявки с лендингов
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Контакты с форм LP-1, LP-2 и LP-3. Фильтры и пагинация применяются к загруженному списку.
          </p>
        </div>
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

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Услуга (LP)
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className={selectClass}
            >
              {SERVICE_FILTER_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Тип клиента
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className={selectClass}
            >
              {CLIENT_FILTER_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            На странице
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={selectClass}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} записей
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Дата с
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className={selectClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Дата по
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className={selectClass}
            />
          </label>
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
                className={`${selectClass} w-full pl-10`}
              />
            </div>
          </label>
        </div>
        {(filterService ||
          filterClient ||
          filterDateFrom ||
          filterDateTo ||
          search) && (
          <button
            type="button"
            onClick={() => {
              setFilterService('');
              setFilterClient('');
              setFilterDateFrom('');
              setFilterDateTo('');
              setSearch('');
            }}
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
              ? 'На сервере нужно добавить метод GET /leads/landing-pages для ролей ADMIN и MANAGER (список лидов из POST /submit-lead с полями LP).'
              : (error?.response?.data?.message ||
                  error?.message ||
                  'Проверьте доступ или попробуйте позже.')}
          </p>
        </div>
      )}

      {!isLoading && !isError && totalFiltered > 0 && (
        <p className="text-sm text-gray-600 mb-3">
          Найдено: <span className="font-semibold text-[#273655]">{totalFiltered}</span>
          {totalFiltered !== allItems.length ? (
            <span className="text-gray-500"> из {allItems.length} загруженных</span>
          ) : null}
          {deferredSearch !== search.trim().toLowerCase() ? (
            <span className="text-gray-400"> (поиск обновляется…)</span>
          ) : null}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-500 text-sm">Загрузка…</div>
      ) : totalFiltered === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500 text-sm">
          {allItems.length === 0 && !isError
            ? 'Пока нет заявок с лендингов или список пуст после ответа сервера.'
            : 'Нет записей по выбранным фильтрам.'}
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Имя</th>
                  <th className="px-4 py-3 font-semibold">Телефон</th>
                  <th className="px-4 py-3 font-semibold">Секция</th>
                  <th className="px-4 py-3 font-semibold">Услуга</th>
                  <th className="px-4 py-3 font-semibold">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name || '—'}</td>
                    <td className="px-4 py-3">
                      <a
                        href={phoneToTelHref(row.phone)}
                        className="inline-flex items-center gap-1.5 font-mono text-[#31876D] font-semibold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
                        {row.phone || '—'}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.page_section || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {SERVICE_LABELS[row.service_type] || row.service_type || '—'}
                      {row.client_type ? (
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {row.client_type === 'b2b' ? 'B2B' : 'B2C'}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatSubmittedAt(row.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-3">
            {pageRows.map((row) => (
              <li
                key={rowKey(row)}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{row.name || '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {SERVICE_LABELS[row.service_type] || row.service_type || '—'}
                    </p>
                  </div>
                  <a
                    href={phoneToTelHref(row.phone)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#31876D] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden />
                    Позвонить
                  </a>
                </div>
                <p className="font-mono text-sm text-[#31876D] mt-2">{row.phone || '—'}</p>
                <p className="text-xs text-gray-600">
                  <span className="text-gray-400">Секция:</span> {row.page_section || '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatSubmittedAt(row.submitted_at)}</p>
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
    </div>
  );
}

export default LpLeadsSection;
