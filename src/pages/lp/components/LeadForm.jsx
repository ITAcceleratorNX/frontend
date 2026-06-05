import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { submitLead, getRateLimitSecondsLeft } from '@/shared/lib/submitLead.js';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';
import { validateKzPhone } from '@/shared/lib/phone.js';
import { PhoneInput } from '@/shared/ui/PhoneInput.jsx';

/**
 * Reusable phone-gating / mini-form for all 3 LPs.
 *
 * Features:
 *  - Name + masked KZ phone input + agreement checkbox.
 *  - Honeypot field (CSS-hidden, tabindex=-1) — bot submits return success but
 *    skip the network call.
 *  - Rate limit handled by submitLead (60s per browser via sessionStorage).
 *  - Optional `successNavigate: { to, state?, replace? }` — после успеха вызывается
 *    `navigate()` (например `/thank-you` с state от LP).
 *  - Fires GTM `form_start` (once) on first focus, plus `form_submit_lead`
 *    on success (the latter is fired by submitLead itself).
 *
 * Visual variants:
 *  - "modal"   — used inside PhoneGatingModal (compact, full-width button)
 *  - "section" — embedded in LP sections (slightly larger labels, can lay grid)
 */

const SUBMIT_LABELS = {
  default: 'Отправить заявку',
  modal: 'Показать номер',
  miniform: 'Отправить заявку',
};

export default function LeadForm({
  serviceType,
  pageSection,
  formId,
  variant = 'section',
  submitLabel,
  showAgreement = true,
  showClientType = false,
  initialClientType = 'b2c',
  onSuccess,
  onError,
  /** После успешной отправки — переход (например на /thank-you) с state для аналитики и UI */
  successNavigate = null,
  className = '',
}) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreement, setAgreement] = useState(true);
  const [clientType, setClientType] = useState(initialClientType);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [cooldown, setCooldown] = useState(() => getRateLimitSecondsLeft());
  const honeypotRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => {
      const left = getRateLimitSecondsLeft();
      setCooldown(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleStart = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent(LP_EVENTS.FORM_START, {
      form_id: formId || `${variant}-${pageSection}`,
      service_type: serviceType,
    });
  }, [formId, variant, pageSection, serviceType]);

  const handlePhoneChange = useCallback((value) => {
    setPhone(value);
    setErrors((prev) => ({ ...prev, phone: undefined }));
  }, []);

  const handleNameChange = useCallback((e) => {
    setName(e.target.value);
    setErrors((prev) => ({ ...prev, name: undefined }));
  }, []);

  const validate = () => {
    const next = {};
    if (!name.trim() || name.trim().length < 2) next.name = 'Введите имя (минимум 2 символа)';
    const phoneError = validateKzPhone(phone, { required: true });
    if (phoneError) next.phone = phoneError;
    if (showAgreement && !agreement) next.agreement = 'Нужно согласие на обработку данных';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    const honeypotValue = honeypotRef.current?.value || '';

    const result = await submitLead({
      name,
      phone,
      service_type: serviceType,
      page_section: pageSection,
      honeypot: honeypotValue,
      agreement,
      ...(showClientType ? { client_type: clientType } : {}),
    });

    setIsSubmitting(false);

    if (result.ok) {
      setCooldown(getRateLimitSecondsLeft());
      onSuccess?.(result.payload);
      if (successNavigate?.to) {
        navigate(successNavigate.to, {
          state: successNavigate.state,
          replace: successNavigate.replace === true,
        });
      }
    } else {
      if (result.error === 'rate_limited') {
        setCooldown(getRateLimitSecondsLeft());
        setServerError('Заявка уже отправлена. Подождите минуту перед повторной отправкой.');
      } else if (result.error === 'network') {
        setServerError('Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз.');
      } else {
        setServerError('Что-то пошло не так. Попробуйте позже или позвоните нам.');
      }
      onError?.(result);
    }
  };

  const baseButtonText = submitLabel || SUBMIT_LABELS[variant] || SUBMIT_LABELS.default;
  const buttonDisabled = isSubmitting || cooldown > 0;
  const buttonText = isSubmitting
    ? 'Отправка…'
    : cooldown > 0
      ? `Можно отправить через ${cooldown} сек`
      : baseButtonText;

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={handleStart}
      noValidate
      className={`flex flex-col gap-4 ${className}`}
      data-form-id={formId}
    >
      {/* honeypot — hidden from users, tempts bots */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        <label>
          Не заполняйте это поле
          <input
            ref={honeypotRef}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            name="company_website"
            defaultValue=""
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`lp-name-${formId}`} className="text-sm font-medium text-[#273655]">
          Ваше имя
        </label>
        <input
          id={`lp-name-${formId}`}
          type="text"
          inputMode="text"
          autoComplete="name"
          placeholder="Например, Алина"
          value={name}
          onChange={handleNameChange}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-[#273655] placeholder:text-[#9ba3b4] focus:outline-none focus:ring-2 focus:ring-[#31876D]/40 ${
            errors.name ? 'border-red-400' : 'border-[#d5d8e1]'
          }`}
        />
        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
      </div>

      <PhoneInput
        id={`lp-phone-${formId}`}
        label="Телефон"
        labelClassName="text-sm font-medium text-[#273655]"
        value={phone}
        onChange={handlePhoneChange}
        error={errors.phone}
        variant="account"
        inputClassName={`h-12 rounded-xl px-4 text-[15px] placeholder:text-[#9ba3b4] focus:ring-[#31876D]/40 ${
          errors.phone ? 'border-red-400' : 'border-[#d5d8e1]'
        }`}
      />

      {showClientType && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[#273655]">Кому хранить?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'b2c', label: 'Для дома' },
              { value: 'b2b', label: 'Для бизнеса' },
            ].map((opt) => {
              const active = clientType === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setClientType(opt.value)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition ${
                    active
                      ? 'border-[#31876D] bg-[#31876D]/10 text-[#31876D]'
                      : 'border-[#d5d8e1] bg-white text-[#273655] hover:border-[#9ba3b4]'
                  }`}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {showAgreement && (
        <label className="flex items-start gap-2 text-xs text-[#6b7280]">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => {
              setAgreement(e.target.checked);
              setErrors((prev) => ({ ...prev, agreement: undefined }));
            }}
            className="mt-0.5 h-4 w-4 rounded border-[#d5d8e1] accent-[#31876D]"
          />
          <span>
            Соглашаюсь с обработкой персональных данных и{' '}
            <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#31876D] underline">
              политикой конфиденциальности
            </Link>
          </span>
        </label>
      )}
      {errors.agreement && <span className="-mt-2 text-xs text-red-500">{errors.agreement}</span>}

      {serverError && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={buttonDisabled}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#31876D] px-6 text-sm font-semibold text-white transition hover:bg-[#2a7260] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {buttonText}
      </button>
    </form>
  );
}
