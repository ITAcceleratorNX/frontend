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
const WHATSAPP_PHONE = '77783911425';
const WHATSAPP_MESSAGE = encodeURIComponent('Здравствуйте! Хочу забронировать бокс.');
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE}?text=${WHATSAPP_MESSAGE}`;

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
              <div className="flex-1 space-y-1">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B6B6B]">Или позвоните нам</p>
                <div className="flex items-center justify-between">
                  <a
                    href={TEL_LINK}
                    className="text-lg font-semibold text-[#00A991] transition hover:text-[#008a7a]"
                  >
                    {DISPLAY_PHONE}
                  </a>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-white transition hover:bg-[#1fb65a] hover:scale-110"
                    aria-label="Написать в WhatsApp"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </div>
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
                  className="w-full h-10 rounded-xl bg-[#00A991] text-sm font-semibold text-white transition hover:bg-[#008a7a]"
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

