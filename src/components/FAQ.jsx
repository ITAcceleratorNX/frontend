import React, { useState, memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../shared/api/axios';
import textAlignIcon from '../assets/textalign-justifycenter.svg';

// Ключ для запроса FAQ
const FAQ_QUERY_KEY = 'faq';

const FAQ = memo(() => {
  const [openItems, setOpenItems] = useState({});

  // Используем React Query для кеширования и предотвращения лишних запросов
  const { data: faqItems = [], isLoading, error } = useQuery({
    queryKey: [FAQ_QUERY_KEY],
    queryFn: async () => {
      const response = await api.get('/faq');
      // Берем только первые 5 вопросов
      return response.data.slice(0, 5);
    },
    staleTime: 60 * 60 * 1000, // Кеш действителен 60 минут
    cacheTime: 120 * 60 * 1000, // Храним кеш 2 часа
    refetchOnWindowFocus: false, // Отключаем автоматический рефетч при фокусе окна
    refetchOnMount: false, // Отключаем автоматический рефетч при монтировании
  });

  // Мемоизируем функцию переключения состояния аккордеона
  const toggleItem = useMemo(() => (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // Мемоизируем контент FAQ для предотвращения ререндеров
  const faqContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="w-full max-w-[820px] flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="w-full max-w-[820px] text-center text-red-500 py-4">
          Не удалось загрузить вопросы. Пожалуйста, попробуйте позже.
        </div>
      );
    }
    
    return (
      <div className="w-full max-w-[820px] flex flex-col gap-7">
        {faqItems.map((faq, index) => (
          <div key={faq.id} className="accordion-item">
            <div 
              className="flex items-center justify-between bg-white border border-[#3E4958] rounded-3xl px-8 py-5 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              onClick={() => toggleItem(faq.id)}
            >
              <div className="flex items-center min-w-[100px] flex-1">
                <span className="text-4xl text-[#000000] mr-4" style={{fontFamily: 'Space Grotesk', fontWeight: 400, lineHeight: '100%', letterSpacing: 0}}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-xl text-[#222] font-normal font-['Space_Grotesk']">
                  {faq.question}
                </span>
              </div>
              <div className="flex items-center justify-center w-11 h-11 border border-[#3E4958] rounded-full text-[#3E4958] text-3xl font-bold transition bg-[#F3F3F3] hover:bg-[#E0E0E0]">
                <span className="mt-[-2px] font-extrabold" style={{color:'#191A23', fontWeight:900}}>
                  {openItems[faq.id] ? '−' : '+'}
                </span>
              </div>
            </div>
            {openItems[faq.id] && (
              <div className="px-8 py-6 ml-16 text-[#3E4958] text-lg mt-2 mb-2 bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [faqItems, isLoading, error, openItems, toggleItem]);

  return (
    <section className="w-full flex flex-col items-center justify-center mb-24 font-['Montserrat']">
      {/* Заголовок секции */}
      <div className="flex items-center mb-4">
        <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
        <span className="text-xs text-[#A6A6A6] font-medium">Информация</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-medium text-[#273655] text-center mb-10">Часто задаваемые вопросы:</h2>
      
      {faqContent}
    </section>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ; 