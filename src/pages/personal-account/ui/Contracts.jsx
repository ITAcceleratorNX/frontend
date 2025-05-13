import React, { useState, useRef, useEffect } from 'react';
import smallBox from '../../../assets/small_box.png';
import { Check } from 'lucide-react';
import image46 from '../../../assets/image_46.png';
import documentImg from '../../../assets/Document.png';
import zavoz1 from '../../../assets/zavoz1.png';
import zavoz2 from '../../../assets/zavoz2.png';

const contracts = [
  {
    name: 'Individual Storage (15 м²)',
    location: 'Жандосова 55, #A-203',
    time: '12.08.2019 - 12.12.2019',
    price: '$24',
    status: 'Подписан',
    statusType: 'success',
  },
  {
    name: 'Individual Storage (5 м²)',
    location: 'Жандосова 55, #A-203',
    time: '12.08.2019 - 12.12.2019',
    price: '$24,295',
    status: 'Подписан',
    statusType: 'success',
  },
  {
    name: 'Individual Storage (35 м²)',
    location: 'Жандосова 55, #A-203',
    time: '12.08.2019 - 12.12.2019',
    price: '$12,295',
    status: 'Договор завершен',
    statusType: 'danger',
  },
  {
    name: 'Individual Storage (35 м²)',
    location: 'Жандосова 55, #A-203',
    time: '12.08.2019 - 12.12.2019',
    price: '$24,295',
    status: 'Требует подписание',
    statusType: 'warning',
  },
];

const statusStyles = {
  success: 'bg-[#00B69B] text-[#FFFFFF]',
  danger: 'bg-[#FD5454] text-[#FFFFFF]',
  warning: 'bg-[#FCBE2D] text-[#FFFFFF]',
};

const steps = [
  { key: 'select', label: 'Выбран склад' },
  { key: 'payment', label: 'Оплата аренды' },
  { key: 'sign', label: 'Подписание договора' },
  { key: 'keys', label: 'Получение ключей' },
  { key: 'move', label: 'Завоз вещей на склад' },
  { key: 'use', label: 'Использование' },
];

const ContractSteps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState([0]); 

  const handleStepClick = (idx) => {
    setActiveStep(idx);
  };

  return (
    <div className="w-full max-w-[1100px] mt-12">
      {/* Блок с названием и статусом подписки */}
      <div className="w-full flex items-center gap-2 mb-8 mt-2">
        <span className="text-[28px] -ml-48 font-['Nunito Sans'] font-normal underline underline-offset-2">Individual Storage (15 м²)</span>
        <span className="ml-5 bg-[#00B69B] text-white text-[13px] font-normal px-4 py-1 rounded-full">Подписан</span>
      </div>
      {/* Панель этапов */}
      <div className="w-full">
        <div className="w-[1310px] -ml-48 flex items-center justify-between border-b border-[#5FC3B4]">
          {steps.map((step, idx) => (
            <button
              key={step.key}
              onClick={() => handleStepClick(idx)}
              className="flex flex-col items-center flex-1 group focus:outline-none"
              style={{minWidth: 0}}
            >
              <div className="flex items-center gap-2 mb-1">
                {stepsCompleted.includes(idx) ? (
                  <Check size={20} className="text-[#5FC3B4]" />
                ) : null}
                <span className={
                  idx === activeStep
                    ? 'text-[#2B4A3D] font-semibold'
                    : stepsCompleted.includes(idx)
                      ? 'text-[#5FC3B4] font-normal'
                      : 'text-[#2B4A3D] font-normal opacity-70'
                }>
                  {step.label}
                </span>
              </div>
              <div className={
                idx === activeStep
                  ? 'h-[2px] bg-[#5FC3B4] w-full rounded-t'
                  : 'h-[2px] bg-transparent w-full'
              } />
            </button>
          ))}
        </div>
      </div>
      {/* Контент для активного шага */}
      <div className="mt-8 min-h-[600px] text-[#222] text-lg font-['Nunito Sans'] flex flex-col items-center">
        {activeStep === 3 ? (
          <>
            <div className="bg-[#273655] text-white rounded-xl ml-[-550px] mt-8 px-6 py-4 mb-8 w-full max-w-[500px] text-[16px] font-bold" style={{lineHeight: '1.6'}}>
              Тип хранения: Individual Storage (15 м²)<br />
              Номер бокса: #A-203<br />
              Дата начала аренды: 15 марта 2025 г.<br />
              Дата окончания аренды: 15 апреля 2025 г.<br />
              Статус: Ожидает продления
            </div>
            <img src={image46} alt="chat preview" className="mt-6 mb-20 w-full max-w-[500px] shadow" />
            <img src={documentImg} alt="документ" className="mt-14 w-full max-w-[600px] shadow" />
          </>
        ) : activeStep === 4 ? (
          <>
            <img src={zavoz1} alt="Завоз 1" className="mt-10 mb-20 w-full max-w-[600px] mx-auto" />
            <img src={zavoz2} alt="Завоз 2" className="w-full max-w-[900px] mx-auto" />
          </>
        ) : activeStep === 5 ? (
          <div className="w-full flex flex-col items-end pr-10">
            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center gap-4 justify-end">
                <span className="text-[#222] font-bold text-[16px] font-['Montserrat']">Договор аренды:</span>
                <a href="#" className="text-[#222] font-bold underline underline-offset-2 text-[16px]">[Скачать PDF]</a>
              </div>
              <div className="flex items-center gap-4 justify-end">
                <span className="text-[#222] font-bold text-[16px] font-['Montserrat']">Акт приёма-передачи:</span>
                <a href="#" className="text-[#222] font-bold underline underline-offset-2 text-[16px]">[Скачать PDF]</a>
              </div>
              <div className="flex items-center gap-4 justify-end">
                <span className="text-[#222] font-bold text-[16px] font-['Montserrat']">Акт возврата ключей:</span>
                <a href="#" className="text-[#222] font-bold underline underline-offset-2 text-[16px]">[Скачать PDF]</a>
              </div>
            </div>
          </div>
        ) : (
          <>{steps.label}</>
        )}
      </div>
    </div>
  );
};

const months = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
];

function MonthSelector() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('АВГУСТ');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-medium text-[#273655] font-['Nunito Sans']">ДОГОВОРЫ</h2>
      <div className="relative flex items-center" ref={ref}>
        <button
          className="flex items-center border border-[#D5D5D5] rounded-sm px-5 py-1 text-[#A6A6A6] text-[14px] font-normal font-['Nunito Sans'] bg-white hover:bg-[#F5F5F5] transition"
          onClick={() => setOpen((v) => !v)}
        >
          {selected}
          <svg className="ml-2 w-4 h-4 text-[#A6A6A6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-14 w-32 bg-white border border-[#D5D5D5] rounded shadow-lg z-50">
            {months.map((m) => (
              <button
                key={m}
                className={`w-full text-left px-4 py-1 text-[#222] text-[12px] hover:bg-[#F5F5F5] ${selected === m ? 'bg-[#F5F5F5] font-bold' : ''}`}
                onClick={() => { setSelected(m); setOpen(false); }}
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
              {contracts.map((row, idx) => (
                <tr key={idx} className="border-b last:border-b-1 hover:bg-[#979797] transition-colors">
                  <td className="flex items-center gap-3 px-6 py-4 font-normal text-[#222] text-[16px]">
                    <img src={smallBox} alt="box" className="w-8 h-8" />
                    <span className="underline underline-offset-2 cursor-pointer">{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal">{row.location}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal">{row.time}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal">{row.price}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-6 py-1 rounded-2xl text-center text-[14px] font-normal ${statusStyles[row.statusType]}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Панель этапов под таблицей */}
      <ContractSteps />
    </div>
  );
};

export default Contracts; 