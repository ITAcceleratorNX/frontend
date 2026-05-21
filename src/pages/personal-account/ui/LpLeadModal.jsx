import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { lpLeadsApi } from '@/shared/api/lpLeadsApi.js';
import { formatCalendarDateTime } from '@/shared/lib/utils/date.js';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast.js';
import {
  ACTUAL_INTEREST_OPTIONS,
  LEAD_OUTCOME_OPTIONS,
  LEAD_QUALITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NEXT_ACTION_OPTIONS,
  PROCESSING_STATE_LABELS,
  REJECTION_REASON_OPTIONS,
  REQUEST_SCENARIO_OPTIONS,
  STORAGE_DURATION_OPTIONS,
  STORAGE_ITEMS_OPTIONS,
  displayValue,
  formStateToPayload,
  leadToFormState,
} from '@/shared/constants/lpLeadProcessing.js';

const SERVICE_LABELS = {
  individual: 'LP-1 · Аренда бокса',
  camera: 'LP-2 · Камера хранения',
  cloud: 'LP-3 · Облачное хранение',
};

const selectClass =
  'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#273655] focus:border-[#31876D] focus:outline-none focus:ring-2 focus:ring-[#31876D]/20 w-full';

/* eslint-disable react/prop-types */
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 break-words">{displayValue(value)}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">Не выбрано</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
/* eslint-enable react/prop-types */

function LpLeadModal({ open, onOpenChange, leadId, listQueryKey }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ['lp-lead', leadId],
    queryFn: () => lpLeadsApi.getLandingPageLeadById(leadId),
    enabled: open && leadId != null,
  });

  useEffect(() => {
    if (lead) setForm(leadToFormState(lead));
  }, [lead]);

  const saveMutation = useMutation({
    mutationFn: () => lpLeadsApi.updateLandingPageLead(leadId, formStateToPayload(form)),
    onSuccess: () => {
      showSuccessToast('Данные лида сохранены');
      queryClient.invalidateQueries({ queryKey: ['lp-landing-leads'] });
      if (listQueryKey) {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      }
      queryClient.invalidateQueries({ queryKey: ['lp-lead', leadId] });
      onOpenChange(false);
    },
    onError: (err) => {
      showErrorToast(
        err?.response?.data?.message || err?.message || 'Не удалось сохранить данные лида',
      );
    },
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const processingLabel = lead?.processing_state
    ? PROCESSING_STATE_LABELS[lead.processing_state] || lead.processing_state
    : '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#202422]">
            {lead?.name ? `Лид: ${lead.name}` : 'Карточка лида'}
          </DialogTitle>
          <DialogDescription>
            Обработка: {processingLabel}
            {lead?.submitted_at ? (
              <span className="text-gray-500">
                {' '}
                · заявка {formatCalendarDateTime(lead.submitted_at) || ''}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">Загрузка…</p>
        ) : isError || !lead ? (
          <p className="py-8 text-center text-sm text-red-600">Не удалось загрузить лид</p>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-[#273655] mb-3">Данные заявки</h3>
              <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <ReadOnlyField label="Имя" value={lead.name} />
                <ReadOnlyField label="Телефон" value={lead.phone} />
                <ReadOnlyField label="Секция формы" value={lead.page_section} />
                <ReadOnlyField
                  label="Услуга / LP"
                  value={SERVICE_LABELS[lead.service_type] || lead.service_type}
                />
                <ReadOnlyField label="Страница заявки" value={lead.landing_page} />
                <ReadOnlyField label="GCLID" value={lead.gclid} />
                <ReadOnlyField label="Дата заявки" value={formatCalendarDateTime(lead.submitted_at)} />
                <ReadOnlyField label="UTM-метки" value={lead.utm_summary} />
                {lead.utm_source ? (
                  <ReadOnlyField label="utm_source" value={lead.utm_source} />
                ) : null}
                {lead.utm_medium ? (
                  <ReadOnlyField label="utm_medium" value={lead.utm_medium} />
                ) : null}
                {lead.utm_campaign ? (
                  <ReadOnlyField label="utm_campaign" value={lead.utm_campaign} />
                ) : null}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#273655] mb-3">Обработка лида</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Статус лида"
                  value={form.lead_status}
                  onChange={(v) => setField('lead_status', v)}
                  options={LEAD_STATUS_OPTIONS}
                />
                <SelectField
                  label="Качество лида"
                  value={form.lead_quality}
                  onChange={(v) => setField('lead_quality', v)}
                  options={LEAD_QUALITY_OPTIONS}
                />
                <SelectField
                  label="Фактический интерес клиента"
                  value={form.actual_interest}
                  onChange={(v) => setField('actual_interest', v)}
                  options={ACTUAL_INTEREST_OPTIONS}
                />
                <SelectField
                  label="Тип запроса / сценарий клиента"
                  value={form.request_scenario}
                  onChange={(v) => setField('request_scenario', v)}
                  options={REQUEST_SCENARIO_OPTIONS}
                />
                <SelectField
                  label="Срок хранения"
                  value={form.storage_duration}
                  onChange={(v) => setField('storage_duration', v)}
                  options={STORAGE_DURATION_OPTIONS}
                />
                <SelectField
                  label="Что хочет хранить"
                  value={form.storage_items}
                  onChange={(v) => setField('storage_items', v)}
                  options={STORAGE_ITEMS_OPTIONS}
                />
                <SelectField
                  label="Причина отказа"
                  value={form.rejection_reason}
                  onChange={(v) => setField('rejection_reason', v)}
                  options={REJECTION_REASON_OPTIONS}
                />
                <SelectField
                  label="Следующее действие"
                  value={form.next_action}
                  onChange={(v) => setField('next_action', v)}
                  options={NEXT_ACTION_OPTIONS}
                />
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Дата следующего контакта
                  <input
                    type="date"
                    value={form.next_contact_at}
                    onChange={(e) => setField('next_contact_at', e.target.value)}
                    className={selectClass}
                  />
                </label>
                <SelectField
                  label="Итог лида"
                  value={form.lead_outcome}
                  onChange={(v) => setField('lead_outcome', v)}
                  options={LEAD_OUTCOME_OPTIONS}
                />
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 sm:col-span-2">
                  Комментарий менеджера
                  <textarea
                    value={form.manager_comment}
                    onChange={(e) => setField('manager_comment', e.target.value)}
                    rows={4}
                    className={`${selectClass} resize-y min-h-[88px]`}
                    placeholder="Суть разговора, результат контакта…"
                  />
                </label>
              </div>
            </section>

            {(lead.first_processed_at || lead.last_processed_at) && (
              <section className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-xs text-gray-600 space-y-2">
                <h3 className="text-sm font-semibold text-[#273655]">Служебные данные</h3>
                {lead.first_processed_at ? (
                  <p>
                    Первое заполнение:{' '}
                    <span className="font-medium text-gray-800">
                      {lead.first_processed_by_name || '—'}
                    </span>
                    {', '}
                    {formatCalendarDateTime(lead.first_processed_at) || '—'}
                  </p>
                ) : null}
                {lead.last_processed_at ? (
                  <p>
                    Последнее обновление:{' '}
                    <span className="font-medium text-gray-800">
                      {lead.last_processed_by_name || '—'}
                    </span>
                    {', '}
                    {formatCalendarDateTime(lead.last_processed_at) || '—'}
                  </p>
                ) : null}
              </section>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#273655] hover:bg-gray-50"
          >
            Закрыть
          </button>
          {lead && !isLoading ? (
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="rounded-xl bg-[#31876D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a735c] disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Сохранение…' : 'Сохранить'}
            </button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LpLeadModal;
