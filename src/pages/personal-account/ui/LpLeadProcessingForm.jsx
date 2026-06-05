import React from 'react';
import {
  ACTUAL_INTEREST_OPTIONS,
  LEAD_OUTCOME_OPTIONS,
  LEAD_QUALITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  NEXT_ACTION_OPTIONS,
  REJECTION_REASON_OPTIONS,
  REQUEST_SCENARIO_OPTIONS,
  STORAGE_DURATION_OPTIONS,
  STORAGE_ITEMS_OPTIONS,
} from '@/shared/constants/lpLeadProcessing.js';
import {
  CLIENT_TYPE_OPTIONS,
  EMPTY_CLIENT_TYPE_OPTION,
} from '@/shared/constants/manualLpLead.js';
import { FormSelect, getFormInputClass } from '@/shared/ui/FormSelect.jsx';
import { DateField } from '@/shared/ui/DateField.jsx';
import ResponsibleManagerSelect from './ResponsibleManagerSelect.jsx';

const LP_INPUT_CLASS = getFormInputClass('account');

const EMPTY_OPTION = { value: '', label: 'Не выбрано' };

/* eslint-disable react/prop-types */
function SelectField({ label, value, onChange, options }) {
  return (
    <FormSelect
      label={label}
      value={value}
      onChange={onChange}
      options={[EMPTY_OPTION, ...options]}
      placeholder="Не выбрано"
      variant="account"
    />
  );
}

/**
 * Блок полей обработки лида (create + edit).
 */
export default function LpLeadProcessingForm({ form, setField }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormSelect
        label="Тип клиента"
        value={form.client_type || ''}
        onChange={(v) => setField('client_type', v)}
        options={[EMPTY_CLIENT_TYPE_OPTION, ...CLIENT_TYPE_OPTIONS]}
        variant="account"
      />
      <ResponsibleManagerSelect
        value={form.responsible_manager_id || ''}
        onChange={(v) => setField('responsible_manager_id', v)}
      />
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
      <DateField
        label="Дата следующего контакта"
        value={form.next_contact_at}
        onChange={(v) => setField('next_contact_at', v)}
        variant="account"
        allowFutureDates
      />
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
          className={`${LP_INPUT_CLASS} h-auto min-h-[88px] resize-y py-2`}
          placeholder="Суть разговора, результат контакта…"
        />
      </label>
    </div>
  );
}
/* eslint-enable react/prop-types */
