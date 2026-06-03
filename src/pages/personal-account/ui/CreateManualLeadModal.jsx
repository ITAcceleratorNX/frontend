import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { lpLeadsApi } from '@/shared/api/lpLeadsApi.js';
import { showErrorToast, showSuccessToast } from '@/shared/lib/toast.js';
import {
  LEAD_CHANNEL_OPTIONS,
  MANUAL_SERVICE_TYPE_OPTIONS,
} from '@/shared/constants/manualLpLead.js';
import { formStateToPayload } from '@/shared/constants/lpLeadProcessing.js';
import LpLeadProcessingForm from './LpLeadProcessingForm.jsx';

const selectClass =
  'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#273655] focus:border-[#31876D] focus:outline-none focus:ring-2 focus:ring-[#31876D]/20 w-full';

const EMPTY_PROCESSING = {
  lead_status: '',
  lead_quality: '',
  actual_interest: '',
  request_scenario: '',
  storage_duration: '',
  storage_items: '',
  rejection_reason: '',
  next_action: '',
  next_contact_at: '',
  lead_outcome: '',
  manager_comment: '',
};

/* eslint-disable react/prop-types */
function TextField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={selectClass}
      />
    </label>
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

function CreateManualLeadModal({ open, onOpenChange, onCreated }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadChannel, setLeadChannel] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(EMPTY_PROCESSING);

  const resetForm = () => {
    setName('');
    setPhone('');
    setLeadChannel('');
    setServiceType('');
    setNotes('');
    setProcessing(EMPTY_PROCESSING);
  };

  const setProcessingField = (key, value) => {
    setProcessing((prev) => ({ ...prev, [key]: value }));
  };

  const createMutation = useMutation({
    mutationFn: () =>
      lpLeadsApi.createManualLandingPageLead({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        lead_channel: leadChannel || undefined,
        service_type: serviceType || undefined,
        notes: notes.trim() || undefined,
        ...formStateToPayload(processing),
      }),
    onSuccess: (lead) => {
      showSuccessToast('Лид добавлен');
      queryClient.invalidateQueries({ queryKey: ['lp-landing-leads'] });
      resetForm();
      onOpenChange(false);
      onCreated?.(lead?.id);
    },
    onError: (err) => {
      showErrorToast(
        err?.response?.data?.message || err?.message || 'Не удалось сохранить лид',
      );
    },
  });

  const handleOpenChange = (next) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#202422]">Добавить лид вручную</DialogTitle>
          <DialogDescription>
            Зафиксируйте обращение по телефону, мессенджеру или лично. Все поля необязательны.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-[#273655] mb-3">Базовые данные лида</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Имя клиента" value={name} onChange={setName} placeholder="Иван" />
              <TextField
                label="Телефон"
                value={phone}
                onChange={setPhone}
                placeholder="+7 …"
              />
              <SelectField
                label="Источник лида"
                value={leadChannel}
                onChange={setLeadChannel}
                options={LEAD_CHANNEL_OPTIONS}
              />
              <SelectField
                label="Услуга / интерес"
                value={serviceType}
                onChange={setServiceType}
                options={MANUAL_SERVICE_TYPE_OPTIONS}
              />
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 sm:col-span-2">
                Комментарий менеджера
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`${selectClass} resize-y min-h-[72px]`}
                  placeholder="Кратко о сути обращения…"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#273655] mb-3">Обработка лида</h3>
            <LpLeadProcessingForm form={processing} setField={setProcessingField} />
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#273655] hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="rounded-xl bg-[#31876D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a735c] disabled:opacity-60"
          >
            {createMutation.isPending ? 'Сохранение…' : 'Сохранить лид'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateManualLeadModal;
