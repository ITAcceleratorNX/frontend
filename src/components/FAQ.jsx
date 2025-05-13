import React, { useEffect, useState } from 'react';
import api from '../shared/api/axios';
import textAlignIcon from '../assets/textalign-justifycenter.svg';

const FAQ = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        setLoading(true);
        const response = await api.get('/faq');
        // Берем только первые 5 вопросов
        const items = response.data.slice(0, 5);
        setFaqItems(items);
      } catch (err) {
        console.error('Ошибка при загрузке FAQ:', err);
        setError('Не удалось загрузить вопросы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="w-full flex flex-col items-center justify-center mb-24 font-['Montserrat']">
      {/* Заголовок секции */}
      <div className="flex items-center mb-4">
        <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
        <span className="text-xs text-[#A6A6A6] font-medium">Информация</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-medium text-[#273655] text-center mb-10">Часто задаваемые вопросы:</h2>
      
      {loading && (
        <div className="w-full max-w-[820px] flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
        </div>
      )}
      
      {error && (
        <div className="w-full max-w-[820px] text-center text-red-500 py-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
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
      )}
    </section>
  );
};

export default FAQ; 