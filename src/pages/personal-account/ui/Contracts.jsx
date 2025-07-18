import React, { useState, useRef, useEffect } from 'react';
import smallBox from '../../../assets/small_box.png';
import { useContracts } from '../../../shared/lib/hooks/use-orders';
import { Check } from 'lucide-react';
import image46 from '../../../assets/image_46.png';
import documentImg from '../../../assets/Document.png';
import zavoz1 from '../../../assets/zavoz1.png';
import zavoz2 from '../../../assets/zavoz2.png';

const getContractStatusInfo = (status) => {
  const statusMap = {
    0: { text: 'Не подписан', styleKey: 'warning' },
    1: { text: 'Подписан компанией', styleKey: 'warning' },
    2: { text: 'Подписан клиентом', styleKey: 'warning' },
    3: { text: 'Полностью подписан', styleKey: 'success' },
    4: { text: 'Отозван компанией', styleKey: 'danger' },
    5: { text: 'Компания инициировала расторжение', styleKey: 'warning' },
    6: { text: 'Клиент инициировал расторжение', styleKey: 'warning' },
    7: { text: 'Клиент отказался от расторжения', styleKey: 'warning' },
    8: { text: 'Расторгнут', styleKey: 'danger' },
    9: { text: 'Клиент отказался подписывать договор', styleKey: 'danger' },
  };
  return statusMap[status] || { text: `Неизвестный статус (${status})`, styleKey: 'default' };
};

const statusStyles = {
  success: 'bg-[#00B69B] text-[#FFFFFF]',
  danger: 'bg-[#FD5454] text-[#FFFFFF]',
  warning: 'bg-[#FCBE2D] text-[#FFFFFF]',
  default: 'bg-gray-500 text-white',
};

function MonthSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('АВГУСТ');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
    'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-medium text-[#273655] font-['Nunito Sans']">ДОГОВОРЫ</h2>
      <div className="relative flex items-center" ref={ref}>
        <button
          className="flex items-center border border-[#D5D5D5] rounded-sm px-5 py-1 text-[#A6A6A6] text-[14px] font-normal font-['Nunito Sans'] bg-white hover:bg-[#F5F5F5] transition"
          onClick={() => setIsOpen((v) => !v)}
        >
          {selected}
          <svg className="ml-2 w-4 h-4 text-[#A6A6A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-14 w-32 bg-white border border-[#D5D5D5] rounded shadow-lg z-50">
            {months.map((m) => (
              <button
                key={m}
                className={`w-full text-left px-4 py-1 text-[#222] text-[12px] hover:bg-[#F5F5F5] ${selected === m ? 'bg-[#F5F5F5] font-bold' : ''}`}
                onClick={() => { setSelected(m); setIsOpen(false); }}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Contracts = () => {
  const { data: contracts, isLoading, error } = useContracts();

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#273655]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-10 text-red-500">
        Ошибка загрузки договоров: {error.message}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center px-8 pt-8 mt-[-50px]">
      <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-lg p-8" style={{boxShadow:'0 8px 32px 0 rgba(40,40,80,0.10)'}}>
        <MonthSelector />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F1F4F9] text-[#202224] text-[15px] font-['Nunito Sans']">
                <th className="text-left px-6 py-3 font-medium rounded-tl-2xl rounded-bl-2xl">НАЗВАНИЕ</th>
                <th className="text-left px-6 py-3 font-medium">ЛОКАЦИЯ-НОМЕР БОКСА</th>
                <th className="text-left px-6 py-3 font-medium">ВРЕМЯ</th>
                <th className="text-left px-6 py-3 font-medium">ЦЕНА</th>
                <th className="text-left px-6 py-3 text-center font-medium rounded-br-2xl rounded-tr-2xl">СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {contracts && contracts.map((row, idx) => {
                const statusInfo = getContractStatusInfo(row.contract_status);
                return (
                  <tr key={idx} className="border-b last:border-b-1 hover:bg-[#979797] transition-colors">
                    <td className="flex items-center gap-3 px-6 py-4 font-normal text-[#222] text-[16px]">
                      <img src={smallBox} alt="box" className="w-8 h-8" />
                      <span className="underline underline-offset-2 cursor-pointer">{`Individual Storage (${row.total_volume} м²)`}</span>
                    </td>
                    <td className="px-6 py-4 text-[#222] text-[14px] font-normal">{row.warehouse_address}</td>
                    <td className="px-6 py-4 text-[#222] text-[14px] font-normal">{`${formatDate(row.rental_period.start_date)} - ${formatDate(row.rental_period.end_date)}`}</td>
                    <td className="px-6 py-4 text-[#222] text-[14px] font-normal">{'$12,295'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-6 py-1 rounded-2xl text-center text-[14px] font-normal ${statusStyles[statusInfo.styleKey]}`}>{statusInfo.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Contracts; 