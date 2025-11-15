import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, MessageCircle, Send, Instagram, Megaphone, Music } from 'lucide-react';

const LEAD_SOURCES = [
  { value: 'site', label: 'Сайт', icon: Globe, color: '#3B82F6' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#22C55E' },
  { value: 'telegram', label: 'Telegram', icon: Send, color: '#0EA5E9' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: '#F97316' },
  { value: 'tiktok', label: 'TikTok', icon: Music, color: '#000000' },
  { value: 'ads', label: 'Реклама', icon: Megaphone, color: '#6366F1' },
];

const STORAGE_KEY = 'extraspace_lead_source';
const STORAGE_SHOWN_KEY = 'extraspace_lead_source_shown';

export const LeadSourceModal = ({ open, onOpenChange, onSelect }) => {
  const [selectedSource, setSelectedSource] = useState(null);

  const handleSelect = (source) => {
    setSelectedSource(source);
    // Сохраняем в localStorage
    localStorage.setItem(STORAGE_KEY, source.value);
    localStorage.setItem(STORAGE_SHOWN_KEY, 'true');
    
    if (onSelect) {
      onSelect(source.value);
    }
    
    // Закрываем модальное окно через небольшую задержку для лучшего UX
    setTimeout(() => {
      onOpenChange(false);
    }, 300);
  };

  // Если пользователь закрыл модальное окно без выбора, помечаем как показанное
  const handleClose = (open) => {
    if (!open && !selectedSource) {
      // Пользователь закрыл без выбора - помечаем как показанное, чтобы не показывать снова
      localStorage.setItem(STORAGE_SHOWN_KEY, 'true');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Откуда вы узнали о нас?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Помогите нам улучшить сервис, выбрав источник, откуда вы узнали о ExtraSpace
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          {LEAD_SOURCES.map((source) => {
            const Icon = source.icon;
            const isSelected = selectedSource?.value === source.value;
            
            return (
              <button
                key={source.value}
                onClick={() => handleSelect(source)}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? 'border-[#273655] bg-[#273655]/5 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${source.color}20` }}
                >
                  <Icon 
                    className="h-6 w-6" 
                    style={{ color: source.color }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {source.label}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Вы можете пропустить этот вопрос, но ваша информация поможет нам стать лучше
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Хук для получения сохраненного источника лида
export const useLeadSource = () => {
  const [leadSource, setLeadSource] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLeadSource(saved);
    }
  }, []);

  const saveLeadSource = (source) => {
    localStorage.setItem(STORAGE_KEY, source);
    setLeadSource(source);
  };

  const clearLeadSource = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLeadSource(null);
  };

  return { leadSource, saveLeadSource, clearLeadSource };
};

// Проверка, показывалось ли уже модальное окно
export const shouldShowLeadSourceModal = () => {
  return localStorage.getItem(STORAGE_SHOWN_KEY) !== 'true';
};

// Получить сохраненный источник лида
export const getStoredLeadSource = () => {
  return localStorage.getItem(STORAGE_KEY);
};

