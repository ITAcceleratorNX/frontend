import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
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
  PROCESSING_STATE_LABELS,
  displayValue,
  formStateToPayload,
  leadToFormState,
} from '@/shared/constants/lpLeadProcessing.js';
import {
  getLeadChannelLabel,
  getServiceDisplayLabel,
  isManualLpLead,
} from '@/shared/constants/manualLpLead.js';
import LpLeadProcessingForm from './LpLeadProcessingForm.jsx';

/* eslint-disable react/prop-types */
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 break-words">{displayValue(value)}</p>
    </div>
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

  const deleteMutation = useMutation({
    mutationFn: () => lpLeadsApi.deleteLandingPageLead(leadId),
    onSuccess: () => {
      showSuccessToast('Лид удалён');
      queryClient.invalidateQueries({ queryKey: ['lp-landing-leads'] });
      if (listQueryKey) {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      }
      queryClient.removeQueries({ queryKey: ['lp-lead', leadId] });
      onOpenChange(false);
    },
    onError: (err) => {
      showErrorToast(
        err?.response?.data?.message || err?.message || 'Не удалось удалить лид',
      );
    },
  });

  const handleDelete = () => {
    const label = lead?.name && lead.name !== '—' ? lead.name : 'этот лид';
    if (!window.confirm(`Удалить лид «${label}» безвозвратно?`)) return;
    deleteMutation.mutate();
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const isBusy = saveMutation.isPending || deleteMutation.isPending;

  const processingLabel = lead?.processing_state
    ? PROCESSING_STATE_LABELS[lead.processing_state] || lead.processing_state
    : '—';

  const manual = lead ? isManualLpLead(lead) : false;

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
              <h3 className="text-sm font-semibold text-[#273655] mb-3">
                {manual ? 'Данные лида' : 'Данные заявки'}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <ReadOnlyField label="Имя" value={lead.name} />
                <ReadOnlyField label="Телефон" value={lead.phone} />
                {manual ? (
                  <>
                    <ReadOnlyField
                      label="Источник лида"
                      value={lead.lead_channel_label || getLeadChannelLabel(lead.lead_channel)}
                    />
                    <ReadOnlyField label="Секция" value={lead.page_section} />
                    <ReadOnlyField
                      label="Услуга / интерес"
                      value={getServiceDisplayLabel(lead)}
                    />
                    <ReadOnlyField label="Комментарий при создании" value={lead.notes} />
                    <ReadOnlyField label="GCLID" value={null} />
                    <ReadOnlyField label="Страница заявки" value={null} />
                    <ReadOnlyField label="UTM-метки" value={null} />
                  </>
                ) : (
                  <>
                    <ReadOnlyField label="Секция формы" value={lead.page_section} />
                    <ReadOnlyField label="Услуга / LP" value={getServiceDisplayLabel(lead)} />
                    <ReadOnlyField label="Страница заявки" value={lead.landing_page} />
                    <ReadOnlyField label="GCLID" value={lead.gclid} />
                    <ReadOnlyField
                      label="Дата заявки"
                      value={formatCalendarDateTime(lead.submitted_at)}
                    />
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
                  </>
                )}
                {manual ? (
                  <ReadOnlyField
                    label="Дата создания"
                    value={formatCalendarDateTime(lead.submitted_at)}
                  />
                ) : null}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#273655] mb-3">Обработка лида</h3>
              <LpLeadProcessingForm form={form} setField={setField} />
            </section>

            {(lead.first_processed_at || lead.last_processed_at) && (
              <section className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-xs text-gray-600 space-y-2">
                <h3 className="text-sm font-semibold text-[#273655]">Служебные данные</h3>
                {manual && lead.first_processed_by_name ? (
                  <p>
                    Создал лид:{' '}
                    <span className="font-medium text-gray-800">{lead.first_processed_by_name}</span>
                    {lead.first_processed_at
                      ? `, ${formatCalendarDateTime(lead.first_processed_at) || '—'}`
                      : null}
                  </p>
                ) : null}
                {lead.first_processed_at && !manual ? (
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

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          {lead && !isLoading ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" aria-hidden />
              {deleteMutation.isPending ? 'Удаление…' : 'Удалить'}
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#273655] hover:bg-gray-50 disabled:opacity-60"
            >
              Закрыть
            </button>
            {lead && !isLoading ? (
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={isBusy}
                className="rounded-xl bg-[#31876D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a735c] disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Сохранение…' : 'Сохранить'}
              </button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LpLeadModal;
