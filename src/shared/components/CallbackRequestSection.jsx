import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, ChevronRight } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../lib/toast';
import api from '@/shared/api/axios.js';
import {
  DISPLAY_PHONE,
  TEL_LINK,
  WHATSAPP_LINK,
} from './CallbackRequestModal.jsx';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';

const formatPhoneNumber = (value) => {
  const numbers = value.replace(/\D/g, '');
  let cleaned = numbers;
  if (cleaned.startsWith('8')) cleaned = '7' + cleaned.slice(1);
  if (cleaned && !cleaned.startsWith('7')) cleaned = '7' + cleaned;
  cleaned = cleaned.slice(0, 11);
  let formatted = '';
  if (cleaned.length > 0) {
    formatted = '+7';
    if (cleaned.length > 1) formatted += ' ' + cleaned.slice(1, 4);
    if (cleaned.length > 4) formatted += ' ' + cleaned.slice(4, 7);
    if (cleaned.length > 7) formatted += ' ' + cleaned.slice(7, 9);
    if (cleaned.length > 9) formatted += ' ' + cleaned.slice(9, 11);
  }
  return formatted;
};

const validatePhone = (phone) => /^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(phone);

const buildLeadPayload = (formData) => {
  const base = { ...formData, name: formData.name.trim(), phone: formData.phone };
  if (typeof window === 'undefined') return base;
  return {
    ...base,
    storage_type: localStorage.getItem('prep_storage_type') || null,
    duration: localStorage.getItem('prep_duration') || null,
    area: localStorage.getItem('prep_area') || null,
    price: localStorage.getItem('calculated_price') || null,
  };
};

const CallbackRequestSection = ({ showRegisterPrompt = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await api.post('/submit-lead', buildLeadPayload(formData));
      if (response?.data?.success) {
        showSuccessToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
        setFormData({ name: '', phone: '' });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('prep_storage_type');
          localStorage.removeItem('prep_duration');
          localStorage.removeItem('prep_area');
          localStorage.removeItem('calculated_price');
        }
      } else {
        throw new Error('Ошибка при отправке');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Не удалось отправить данные. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl bg-[#F7FAF9] p-8 sm:p-10 lg:p-12 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Левая колонка */}
            <div className="flex-1 w-full lg:max-w-[45%] space-y-4">
              <h2 className="font-sf-pro-text text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202422] leading-tight">
                ЗАКАЗАТЬ<br />ОБРАТНЫЙ ЗВОНОК
              </h2>
              <p className="text-sm text-gray-600">
                Зарегистрируйтесь и бронируйте бокс самостоятельно — быстро и без ожидания звонка
              </p>
              {showRegisterPrompt && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/login', { state: { from: '/' } })}
                    className="inline-flex items-center gap-2 text-[#31876D] font-medium hover:opacity-80 transition-opacity"
                  >
                    <span>Войти</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Правая колонка */}
            <div className="flex-1 w-full lg:max-w-[55%] space-y-4">
              <p className="text-sm text-gray-600">
                Оставьте контакты, и мы перезвоним, чтобы ответить на вопросы и помочь с подбором бокса.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-3 gap-y-4">
                  <div className="relative min-w-0">
                    <Input
                      type="text"
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-3 pr-10 text-[#373737] placeholder:text-gray-400"
                      autoComplete="name"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <div className="hidden sm:block" aria-hidden="true" />
                  <div className="relative min-w-0">
                    <Input
                      type="tel"
                      placeholder="Телефон"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-3 pr-10 text-[#373737] placeholder:text-gray-400"
                      autoComplete="tel"
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 rounded-xl bg-[#31876D] text-base font-semibold text-white hover:bg-[#2a7260] transition-colors disabled:opacity-70 sm:self-start"
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-gray-600">
                    Или позвоните нам:{' '}
                    <a href={TEL_LINK} className="text-[#31876D] underline hover:opacity-80">
                      {DISPLAY_PHONE}
                    </a>
                  </p>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    aria-label="WhatsApp"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#128C7E" xmlns="http://www.w3.org/2000/svg" className="hover:opacity-80 transition-opacity">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallbackRequestSection;
