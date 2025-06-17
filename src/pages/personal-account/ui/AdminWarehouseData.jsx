import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';

const DUMMY_WAREHOUSES = [
  {
    id: "1",
    status: "Inactive",
    name: "Есентай",
    address: "жилой комплекс Касымова улица, 32",
    comments: 116,
  },
  {
    id: "2",
    status: "Active",
    name: "ЖК Mega Tower Almaty",
    address: "Улица Абиша Кекилбайулы, 270 блок 4",
    comments: 200,
  },
  {
    id: "3",
    status: "Inactive",
    name: "Есентай",
    address: "жилой комплекс Касымова улица, 32",
    comments: 116,
  },
  {
    id: "4",
    status: "Active",
    name: "ЖК Mega Tower Almaty",
    address: "Улица Абиша Кекилбайулы, 270 блок 4",
    comments: 116,
  },
  {
    id: "5",
    status: "Inactive",
    name: "Есентай",
    address: "жилой комплекс Касымова улица, 32",
    comments: 116,
  },
  {
    id: "6",
    status: "Active",
    name: "ЖК Mega Tower Almaty",
    address: "Улица Абиша Кекилбайулы, 270 блок 4",
    comments: 116,
  },
  {
    id: "7",
    status: "Active",
    name: "ЖК Mega Tower Almaty",
    address: "Улица Абиша Кекилбайулы, 270 блок 4",
    comments: 116,
  },
  {
    id: "8",
    status: "Inactive",
    name: "Есентай",
    address: "жилой комплекс Касымова улица, 32",
    comments: 116,
  },
];

const AdminWarehouseData = () => {
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const [activeNav, setActiveNav] = useState('warehouses');

  const warehouse = DUMMY_WAREHOUSES.find(w => w.id === warehouseId);

  if (!warehouse) {
    return <div className="p-6">Склад не найден.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 mr-[110px]">
          <div className="w-full flex flex-col items-center pt-8">
            <div className="w-[1150px] ml-[80px] bg-white rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div 
                  onClick={() => navigate('/personal-account', { state: { activeSection: 'warehouses' } })}
                  className="flex items-center text-[#000000] text-lg mr-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span className="font-['Nunito Sans']">Данные склада</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg shadow-md border border-gray-200 ${warehouse.status === 'Active' ? 'bg-white' : 'bg-[#DEE0E4]'}`}>
                  <div
                    className={`text-white text-xs px-7 font-['Abhaya Libre SemiBold'] py-1.5 rounded-full inline-block mb-2 ${warehouse.status === 'Active' ? 'bg-[#3A532D]' : 'bg-[#777777]'}`}
                  >
                    {warehouse.status}
                  </div>
                  <h2 className="text-lg font-semibold mb-1">{warehouse.name}</h2>
                  <p className="text-sm text-[#000000]">{warehouse.address}</p>
                  <div className="border-t border-[#263654] mt-4 pt-4 flex items-center justify-center text-[#000000] text-sm">
                    <svg className="w-4 h-4" width="16" height="17" viewBox="0 0 16 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.0007 10.5C10.5311 10.5 11.0398 10.2893 11.4149 9.91421C11.7899 9.53914 12.0007 9.03043 12.0007 8.5V4.5C12.0007 3.96957 11.7899 3.46086 11.4149 3.08579C11.0398 2.71071 10.5311 2.5 10.0007 2.5H3.33398C2.80355 2.5 2.29484 2.71071 1.91977 3.08579C1.5447 3.46086 1.33398 3.96957 1.33398 4.5V8.5C1.33398 9.03043 1.5447 9.53914 1.91977 9.91421C2.29484 10.2893 2.80355 10.5 3.33398 10.5H4.00065V11.8333C3.99833 11.9513 4.02734 12.0677 4.08473 12.1708C4.14212 12.2739 4.22583 12.3599 4.32732 12.42C4.42866 12.4785 4.54363 12.5093 4.66065 12.5093C4.77768 12.5093 4.89264 12.4785 4.99398 12.42L8.18065 10.5H10.0007ZM5.33398 10.6467V9.83333C5.33538 9.74448 5.31899 9.65624 5.28579 9.57381C5.25259 9.49138 5.20324 9.41642 5.14065 9.35333C5.01376 9.23098 4.84357 9.16387 4.66732 9.16667H3.33398C3.15717 9.16667 2.9876 9.09643 2.86258 8.9714C2.73756 8.84638 2.66732 8.67681 2.66732 8.5V4.5C2.66732 4.32319 2.73756 4.15362 2.86258 4.0286C2.9876 3.90357 3.15717 3.83333 3.33398 3.83333H10.0007C10.1775 3.83333 10.347 3.90357 10.4721 4.0286C10.5971 4.15362 10.6673 4.32319 10.6673 4.5V8.5C10.6673 8.67681 10.5971 8.84638 10.4721 8.9714C10.347 9.09643 10.1775 9.16667 10.0007 9.16667H8.00065C7.881 9.1667 7.76356 9.19894 7.66065 9.26L5.33398 10.6467ZM15.334 8.5V11.1667C15.334 11.6971 15.1233 12.2058 14.7482 12.5809C14.3731 12.956 13.8644 13.1667 13.334 13.1667H12.6673V14.5C12.6673 14.6238 12.6328 14.7452 12.5678 14.8505C12.5027 14.9558 12.4095 15.0409 12.2988 15.0963C12.1881 15.1517 12.0641 15.1751 11.9408 15.164C11.8175 15.1529 11.6997 15.1076 11.6007 15.0333L9.11398 13.1667H8.00065C7.82384 13.1667 7.65427 13.0964 7.52925 12.9714C7.40422 12.8464 7.33398 12.6768 7.33398 12.5C7.33398 12.3232 7.40422 12.1536 7.52925 12.0286C7.65427 11.9036 7.82384 11.8333 8.00065 11.8333H9.33398C9.41597 11.836 9.497 11.8517 9.57398 11.88L9.64065 11.92L9.73398 11.9667L11.334 13.1667V12.5C11.334 12.3232 11.4042 12.1536 11.5292 12.0286C11.6543 11.9036 11.8238 11.8333 12.0007 11.8333H13.334C13.5108 11.8333 13.6804 11.7631 13.8054 11.6381C13.9304 11.513 14.0007 11.3435 14.0007 11.1667V8.5C14.0007 8.32319 13.9304 8.15362 13.8054 8.0286C13.6804 7.90357 13.5108 7.83333 13.334 7.83333C13.1572 7.83333 12.9876 7.7631 12.8626 7.63807C12.7376 7.51305 12.6673 7.34348 12.6673 7.16667C12.6673 6.98986 12.7376 6.82029 12.8626 6.69526C12.9876 6.57024 13.1572 6.5 13.334 6.5C13.8644 6.5 14.3731 6.71071 14.7482 7.08579C15.1233 7.46086 15.334 7.96957 15.334 8.5Z"/>
                    </svg>
                    <span>{warehouse.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminWarehouseData;