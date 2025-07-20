import React, { useState, useRef, useEffect } from 'react';
import smallBox from '../../../assets/small_box.png';
import { useContracts, useCancelContract, useDownloadContract } from '../../../shared/lib/hooks/use-orders';
import { Check, Download } from 'lucide-react';
import image46 from '../../../assets/image_46.png';
import documentImg from '../../../assets/Document.png';
import zavoz1 from '../../../assets/zavoz1.png';
import zavoz2 from '../../../assets/zavoz2.png';

const getContractStatusStyleKey = (statusText) => {
  const statusMap = {
    'Не подписан': 'warning',
    'Подписан компанией': 'info',
    'Подписан клиентом': 'info',
    'Полностью подписан': 'success',
    'Отозван компанией': 'danger',
    'Компания инициировала расторжение': 'danger',
    'Клиент инициировал расторжение': 'danger',
    'Клиент отказался от расторжения': 'danger',
    'Расторгнут': 'danger',
    'Клиент отказался подписывать договор': 'danger',
  };
  return statusMap[statusText] || 'default';
};

const statusStyles = {
  success: 'bg-[#00B69B] text-white',
  danger: 'bg-[#FD5454] text-white',
  warning: 'bg-[#FCBE2D] text-white',
  info: 'bg-blue-500 text-white',
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
      <h2 className="text-2xl font-medium text-[#273655]">ДОГОВОРЫ</h2>
      <div className="relative flex items-center" ref={ref}>
        <button
          className="flex items-center justify-between w-40 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          onClick={() => setIsOpen((v) => !v)}
        >
          {selected}
          <svg className="ml-2 w-4 h-4 text-[#A6A6A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {months.map((m) => (
              <button
                key={m}
                className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 ${selected === m ? 'bg-blue-50 text-blue-600 font-medium' : 'font-normal'}`}
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
  const cancelContractMutation = useCancelContract();
  const downloadContractMutation = useDownloadContract();

  const handleCancelContract = (orderId, documentId) => {
    cancelContractMutation.mutate({ orderId, documentId });
  };

  const handleDownloadContract = (documentId) => {
    downloadContractMutation.mutate(documentId);
  };

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
    <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-8 mt-[-50px]">
      <div className="w-full max-w-7xl bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <MonthSelector />
        <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm font-medium">
                <th className="text-left px-6 py-4 font-medium">НАЗВАНИЕ</th>
                <th className="text-left px-6 py-4 font-medium">ЛОКАЦИЯ-НОМЕР БОКСА</th>
                <th className="text-left px-6 py-4 font-medium">ВРЕМЯ</th>
              
                <th className="text-left px-6 py-4 text-center font-medium">СТАТУС</th>
                <th className="text-left px-6 py-4 text-center font-medium">ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody>
              {contracts && contracts.map((row, idx) => {
                const styleKey = getContractStatusStyleKey(row.contract_status);
                return (
                  <tr key={idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors duration-200">
                    <td className="flex items-center gap-3 px-6 py-5 font-medium text-gray-900 text-base">
                      <img src={smallBox} alt="box" className="w-9 h-9 flex-shrink-0" />
                      <span className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">{`Individual Storage (${row.total_volume} м²)`}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-600 text-sm">{row.warehouse_address}</td>
                    <td className="px-6 py-5 text-gray-600 text-sm">{`${formatDate(row.rental_period.start_date)} - ${formatDate(row.rental_period.end_date)}`}</td>
                   
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium leading-5 ${statusStyles[styleKey]} min-w-[120px]`}>
                        {row.contract_status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleDownloadContract(row.contract_data.document_id)}
                          disabled={downloadContractMutation.isPending}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Download size={16} className="mr-2" />
                          {downloadContractMutation.isPending ? 'Загрузка...' : 'Скачать'}
                        </button>
                        {row.order_status === 'ACTIVE' && (
                          <button
                            onClick={() => handleCancelContract(row.order_id, row.contract_data.document_id)}
                            disabled={cancelContractMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {cancelContractMutation.isPending ? 'Отмена...' : 'Отменить'}
                          </button>
                        )}
                      </div>
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