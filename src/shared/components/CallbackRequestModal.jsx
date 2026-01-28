import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../lib/toast';
import api from '@/shared/api/axios.js';

export const DISPLAY_PHONE = '+7 778 391-14-25';
export const TEL_LINK = 'tel:+77783911425';

const formatPhoneNumber = (value) => {
  const numbers = value.replace(/\D/g, '');

  let cleaned = numbers;
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  if (cleaned && !cleaned.startsWith('7')) {
    cleaned = '7' + cleaned;
  }

  cleaned = cleaned.slice(0, 11);

  let formatted = '';
  if (cleaned.length > 0) {
    formatted = '+7';
    if (cleaned.length > 1) {
      formatted += ' ' + cleaned.slice(1, 4);
    }
    if (cleaned.length > 4) {
      formatted += ' ' + cleaned.slice(4, 7);
    }
    if (cleaned.length > 7) {
      formatted += ' ' + cleaned.slice(7, 9);
    }
    if (cleaned.length > 9) {
      formatted += ' ' + cleaned.slice(9, 11);
    }
  }

  return formatted;
};

const validatePhone = (phone) => /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(phone);

const buildLeadPayload = (formData) => {
  const basePayload = {
    ...formData,
    name: formData.name.trim(),
    phone: formData.phone,
  };

  if (typeof window === 'undefined') {
    return basePayload;
  }

  return {
    ...basePayload,
    storage_type: localStorage.getItem('prep_storage_type') || null,
    duration: localStorage.getItem('prep_duration') || null,
    area: localStorage.getItem('prep_area') || null,
    price: localStorage.getItem('calculated_price') || null,
  };
};

const CallbackRequestModal = ({
  open,
  onOpenChange,
  showRegisterPrompt = false,
  title = 'Заказать обратный звонок',
  description,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedDescription = useMemo(() => {
    if (description) {
      return description;
    }
    return 'Оставьте контакты, и мы перезвоним, чтобы ответить на вопросы и помочь с подбором бокса.';
  }, [description]);

  useEffect(() => {
    if (!open) {
      setFormData({ name: '', phone: '' });
      setIsSubmitting(false);
    }
  }, [open]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value,
    }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast('Введите имя');
      return;
    }

    if (!validatePhone(formData.phone)) {
      showErrorToast('Введите номер в формате +7 777 777 77 77');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildLeadPayload(formData);
      const response = await api.post('/submit-lead', payload);

      if (response?.data?.success) {
        showSuccessToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
        setFormData({ name: '', phone: '' });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('prep_storage_type');
          localStorage.removeItem('prep_duration');
          localStorage.removeItem('prep_area');
          localStorage.removeItem('calculated_price');
        }
        onOpenChange(false);
      } else {
        throw new Error('Ошибка при отправке');
      }
    } catch (error) {
      console.error('Не удалось отправить заявку', error);
      showErrorToast('Не удалось отправить данные. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl border-none p-0">
        <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 sm:p-8">
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-2xl font-bold text-[#273655]">{title}</DialogTitle>
            <p className="text-sm text-[#6B6B6B]">{resolvedDescription}</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#273655]" htmlFor="callback-name">
                Ваше имя
              </label>
              <Input
                id="callback-name"
                type="text"
                placeholder="Например: Алина"
                value={formData.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
                className="h-12 rounded-xl border border-[#d5d8e1] bg-white text-base text-[#273655] placeholder:text-[#B0B7C3]"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#273655]" htmlFor="callback-phone">
                Телефон
              </label>
              <Input
                id="callback-phone"
                type="tel"
                placeholder="+7 777 777 77 77"
                value={formData.phone}
                onChange={(event) => handleInputChange('phone', event.target.value)}
                className="h-12 rounded-xl border border-[#d5d8e1] bg-white text-base text-[#273655] placeholder:text-[#B0B7C3]"
                autoComplete="tel"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-[#00A991] text-base font-semibold text-white transition hover:bg-[#008a7a]"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </form>

          <div className="flex flex-col gap-4 rounded-2xl bg-[#F5F6FA] p-4 text-sm text-[#273655]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Phone className="h-5 w-5 text-[#00A991]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B6B6B]">Или позвоните нам</p>
                <a
                  href={TEL_LINK}
                  className="text-lg font-semibold text-[#00A991] transition hover:text-[#008a7a]"
                >
                  {DISPLAY_PHONE}
                </a>
              </div>
            </div>

            {showRegisterPrompt && (
              <div className="rounded-xl border border-dashed border-[#00A991]/30 bg-[#00A991]/5 p-3 text-sm space-y-3">
                <p className="text-[#273655]">
                  <Link to="/register" className="font-semibold text-[#00A991] underline underline-offset-4">
                    Зарегистрируйтесь
                  </Link>
                  {' '}и бронируйте бокс самостоятельно — быстро и без ожидания звонка
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/login', { state: { from: '/' } });
                  }}
                  className="w-full h-10 rounded-xl bg-[#273655] text-sm font-semibold text-white transition hover:bg-[#1e2a4a]"
                >
                  Войти
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallbackRequestModal;

