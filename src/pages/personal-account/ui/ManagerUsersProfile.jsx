import React, { useEffect, useState, memo, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import personalImg from '../../../assets/personal_account_image.png';
import Input from '../../../shared/ui/Input';
import { isEqual } from 'lodash-es';
import smallBox from '../../../assets/small_box.png';
import Arhive_load_light from '../../../assets/Arhive_load_light.svg';
import Arhive_load_light_2 from '../../../assets/Arhive_load_light_2.svg';

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

const DUMMY_PAYMENTS = [
  {
    id: "1",
    name: "Individual Storage (15 м²)",
    box: "#A-203",
    paymentMethod: "Visa **** **** **** 3947",
    time: "12.08.2019 17:00",
    deposit: "Зачислен в последний месяц аренды",
    amount: "$150",
    status: "Оплачено",
    statusType: "paid",
  },
  {
    id: "2",
    name: "Individual Storage (5 м²)",
    box: "#A-204",
    paymentMethod: "MasterCard **** **** 9994",
    time: "12.08.2019 16:00",
    deposit: "Не зачислен",
    amount: "$240",
    status: "Не оплачено",
    statusType: "unpaid",
  },
];

const paymentStatusStyles = {
  'paid': 'bg-[#00B69B] text-white',
  'unpaid': 'bg-[#F86812] text-white',
  'pending': 'bg-[#F1F4F9] text-[#202224]',
  'cancelled': 'bg-[#F1F4F9] text-[#202224]'
};

const months = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
];

function MonthSelector() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('АВГУСТ');
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between mb-8">
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

const PaymentHistory = () => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('АВГУСТ');
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col items-center pt-8 mt-12">
      <div className="w-[1150px] ml-[80px] bg-white rounded-2xl shadow-lg p-8" style={{boxShadow:'0 8px 32px 0 rgba(40,40,80,0.10)'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium text-[#273655] font-['Nunito Sans']">История платежей</h2>
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
        <div className="w-full">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F1F4F9] text-[#202224] text-[15px] font-['Nunito Sans']">
                <th className="text-left px-6 py-3 font-medium rounded-tl-2xl rounded-bl-2xl">НАЗВАНИЕ</th>
                <th className="text-left px-6 py-3 font-medium">Метод-оплаты</th>
                <th className="text-left px-6 py-3 font-medium">ВРЕМЯ</th>
                <th className="text-left px-6 py-3 font-medium">Депозит</th>
                <th className="text-left px-6 py-3 font-medium">Сумма</th>
                <th className="text-left px-6 py-3 text-center font-medium rounded-br-2xl rounded-tr-2xl">СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_PAYMENTS.map((payment) => (
                <tr key={payment.id} className="border-b last:border-b-1 hover:bg-[#979797] transition-colors">
                  <td className="px-[-2px] py-4 font-normal text-[#222] text-[16px]">
                    <span className="underline underline-offset-2 cursor-pointer whitespace-nowrap">{payment.name}</span><br/>
                    <span className="text-[#222] text-[14px] whitespace-nowrap">{payment.box}</span>
                  </td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{payment.time}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{payment.deposit}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{payment.amount}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`px-6 py-1 rounded-2xl text-center text-[14px] font-normal ${paymentStatusStyles[payment.statusType]}`}>{payment.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Contracts = () => {
  return (
    <div className="w-full flex flex-col items-center pt-8 mt-2">
      <div className="w-[1150px] ml-[80px] bg-white rounded-2xl shadow-lg p-8" style={{boxShadow:'0 8px 32px 0 rgba(40,40,80,0.10)'}}>
        <MonthSelector />
        <div className="w-full">
          <table className="w-full">
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
                  <td className="flex items-center gap-3 px-6 py-4 font-normal text-[#222] text-[16px] whitespace-nowrap">
                    <img src={smallBox} alt="box" className="w-8 h-8" />
                    <span className="underline underline-offset-2 cursor-pointer">{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{row.location}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{row.time}</td>
                  <td className="px-6 py-4 text-[#222] text-[14px] font-normal whitespace-nowrap">{row.price}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`px-6 py-1 rounded-2xl text-center text-[14px] font-normal ${statusStyles[row.statusType]}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StorageInfoFrame = () => {
  return (
    <div className="w-full flex flex-col items-center pt-8 mt-2">
      <div className="w-[1150px] ml-[80px] bg-white rounded-2xl p-8">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-small text-[#000000] font-['Nunito Sans'] underline">
            Individual Storage (15 м²)
          </h2>
          <span className="ml-4 px-3 py-1 bg-[#00B69B] text-white text-xs rounded-full">Подписан</span>
        </div>

        <div className="flex justify-between items-start">
          <div className="w-[550px] font-['Montserrat'] bg-white border border-[#D5D5D5] rounded-lg p-6 mr-6" style={{boxShadow:'0 4px 16px 0 rgba(40,40,80,0.05)'}}>
            <h2 className="text-2xl font-medium mb-2 ml-6">Информация о складе</h2>
            <p className="text-[#222] text-base flex ml-6"><span className="font-medium">Тип хранения:&nbsp; </span><span>Individual Storage (15 м²)</span></p>
            <p className="text-[#222] text-base flex ml-6"><span className="font-medium">Номер бокса:&nbsp; </span><span>#A-203</span></p>
            <p className="text-[#222] text-base flex ml-6"><span className="font-medium">Дата начала аренды:&nbsp; </span><span>15 марта 2025 г.</span></p>
            <p className="text-[#222] text-base flex ml-6"><span className="font-medium">Дата окончания аренды:&nbsp; </span><span>15 апреля 2025 г.</span></p>
            <p className="text-[#222] text-base flex ml-6"><span className="font-medium">Статус:&nbsp; </span><span>Ожидает продления</span></p>
          </div>

          <div className="w-[300px] mr-[170px] flex flex-col space-y-6">
            <button className="flex items-center justify-start pl-0 py-0 bg-[#FFD048] rounded-2xl shadow" style={{boxShadow:'0 4px 16px 0 rgba(40,40,80,0.05)'}}>
              <div className="p-2 border border-[#FFFFFF] rounded-2xl flex items-center justify-start mr-12">
                <img src={Arhive_load_light} alt="Download" className="w-10 h-10 mt-[-5px]" />
              </div>
              <span className="text-[#273655] font-semibold">Договор аренды</span>
            </button>
            <button className="flex items-center justify-start pl-0 py-0 bg-[#193A7E] text-white rounded-2xl shadow" style={{boxShadow:'0 4px 16px 0 rgba(40,40,80,0.05)'}}>
              <div className="p-2 border border-[#707070] rounded-2xl flex items-center justify-start mr-8">
                <img src={Arhive_load_light_2} alt="Download" className="w-10 h-10 mt-[-5px]" />
              </div>
              <span className="font-semibold">Акт приёма-передачи</span>
            </button>
            <button className="flex items-center justify-start pl-0 py-0 bg-white border border-[#D5D5D5] rounded-2xl shadow" style={{boxShadow:'0 4px 16px 0 rgba(40,40,80,0.05)'}}>
              <div className="p-2 border border-[#707070] rounded-2xl flex items-center justify-start mr-9">
                <img src={Arhive_load_light} alt="Download" className="w-10 h-10 mt-[-5px]" />
              </div>
              <span className="text-[#273655] font-semibold">Акт возврата ключей</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerUsersProfile = memo(() => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();

  const defaultValues = useMemo(() => ({
    name: user?.name || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || ''
  }), [user]);

  const { register, setValue, formState: { errors } } = useForm({
    defaultValues
  });

  useEffect(() => {
    if (user && !isEqual(defaultValues, {
      name: user.name || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || ''
    })) {
      setValue('name', user.name || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('dateOfBirth', user.dateOfBirth || '');
    }
  }, [user, setValue, defaultValues]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-600">Не удалось загрузить данные пользователя</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-1">
        <Sidebar activeNav="users" setActiveNav={() => {}} />
        <main className="flex-1 mr-[110px]">
          <div className="max-w-5xl mx-auto py-12 px-10">
            <div className="flex items-center mb-8">
              <button onClick={() => navigate('/personal-account', { state: { activeSection: 'managerusers' } })} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.75 19.5L8.25 12L15.75 4.5" stroke="#273655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-xl font-normal text-[#273655]">Профиль пользователя</h1>
            </div>

            <div className="flex items-start">
              <div className="w-24 h-24 mr-8 flex-shrink-0">
                <img
                  src={personalImg}
                  alt="Аватар"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                <Input
                  label="Имя"
                  type="text"
                  {...register('name')}
                  readOnly
                  className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
                />
                <Input
                  label="Фамилия"
                  type="text"
                  {...register('lastName')}
                  readOnly
                  className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
                />
                <Input
                  label="Электронная почта"
                  type="email"
                  {...register('email')}
                  readOnly
                  className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
                />
                <Input
                  label="Телефон"
                  type="tel"
                  {...register('phone')}
                  readOnly
                  className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
                />
                <Input
                  label="День Рождения"
                  type="text"
                  {...register('dateOfBirth')}
                  readOnly
                  className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
                />
              </div>
            </div>

            <PaymentHistory />
            <Contracts />
            <StorageInfoFrame />
          </div>
        </main>
      </div>
    </div>
  );
});

export default ManagerUsersProfile;