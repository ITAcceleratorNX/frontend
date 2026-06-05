import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
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
import { FormSelect, getFormInputClass } from '@/shared/ui/FormSelect.jsx';
import { PhoneInput } from '@/shared/ui/PhoneInput.jsx';
import { normalizePhoneForSubmit, validateKzPhone } from '@/shared/lib/phone.js';

const LP_INPUT_CLASS = getFormInputClass('account');

const EMPTY_OPTION = { value: '', label: 'Не выбрано' };

const EMPTY_PROCESSING = {
  client_type: '',
  responsible_manager_id: '',
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
        className={LP_INPUT_CLASS}
      />
    </label>
  );
}
/* eslint-enable react/prop-types */

function CreateManualLeadModal({ open, onOpenChange, onCreated }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadChannel, setLeadChannel] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(EMPTY_PROCESSING);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (open && user?.id) {
      setProcessing((prev) => ({
        ...prev,
        responsible_manager_id: String(user.id),
      }));
    }
  }, [open, user?.id]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setLeadChannel('');
    setServiceType('');
    setNotes('');
    setProcessing({
      ...EMPTY_PROCESSING,
      responsible_manager_id: user?.id ? String(user.id) : '',
    });
    setPhoneError('');
  };

  const setProcessingField = (key, value) => {
    setProcessing((prev) => ({ ...prev, [key]: value }));
  };

  const createMutation = useMutation({
    mutationFn: () =>
      lpLeadsApi.createManualLandingPageLead({
        name: name.trim() || undefined,
        phone: phone.trim() ? normalizePhoneForSubmit(phone) : undefined,
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

  const handleSubmit = () => {
    const error = phone.trim() ? validateKzPhone(phone, { required: true }) : null;
    if (error) {
      setPhoneError(error);
      return;
    }
    setPhoneError('');
    createMutation.mutate();
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
              <PhoneInput
                label="Телефон"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setPhoneError('');
                }}
                error={phoneError}
                variant="account"
              />
              <FormSelect
                label="Источник лида"
                value={leadChannel}
                onChange={setLeadChannel}
                options={[EMPTY_OPTION, ...LEAD_CHANNEL_OPTIONS]}
                variant="account"
              />
              <FormSelect
                label="Услуга / интерес"
                value={serviceType}
                onChange={setServiceType}
                options={[EMPTY_OPTION, ...MANUAL_SERVICE_TYPE_OPTIONS]}
                variant="account"
              />
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 sm:col-span-2">
                Комментарий менеджера
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className={`${LP_INPUT_CLASS} h-auto min-h-[72px] resize-y py-2`}
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
            onClick={handleSubmit}
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
