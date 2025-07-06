import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DUMMY_USERS = [
  {
    id: "1",
    fullName: "Leslie Maya",
    email: "leslie@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "October 2, 2010",
    permissions: "Admin",
  },
  {
    id: "2",
    fullName: "Josie Deck",
    email: "josie@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "October 3, 2011",
    permissions: "Admin",
  },
  {
    id: "3",
    fullName: "Alex Pfeiffer",
    email: "alex@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "May 20, 2015",
    permissions: "Admin",
  },
  {
    id: "4",
    fullName: "Mike Dean",
    email: "mike@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "July 14, 2015",
    permissions: "Manager",
  },
  {
    id: "5",
    fullName: "Mateus Cunha",
    email: "cunha@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "October, 2016",
    permissions: "User",
  },
  {
    id: "6",
    fullName: "Nzola Uemo",
    email: "nzola@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "June 5, 2016",
    permissions: "User",
  },
  {
    id: "7",
    fullName: "Antony Mack",
    email: "mack@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "June 15, 2015",
    permissions: "Manager",
  },
  {
    id: "8",
    fullName: "André da Silva",
    email: "andré@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "March 13, 2018",
    permissions: "Manager",
  },
  {
    id: "9",
    fullName: "Jorge Ferreira",
    email: "jorge@gmail.com",
    phone: "+7 747 624 55 55",
    joined: "March 14, 2018",
    permissions: "Manager",
  },
];


const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState('All');
  const [selectedJoinedTime, setSelectedJoinedTime] = useState('Anytime');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = DUMMY_USERS.filter(user => {
    const matchesSearchTerm = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPermissions = selectedPermissions === 'All' || user.permissions === selectedPermissions;
    
    return matchesSearchTerm && matchesPermissions;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Пользователи платформы</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Поиск пользователя..."
            className="w-64 p-2 border border-[#70707087] rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Dropdown for Permissions */}
          <div className="relative font-['Abhaya Libre SemiBold']">
            <select
              className="p-2 border border-[#70707087] rounded-md appearance-none text-left w-48 pr-8"
              value={selectedPermissions}
              onChange={(e) => setSelectedPermissions(e.target.value)}
            >
              <option value="All" className="text-[#FF8B37]">Permissions All</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.243 4.243z"/>
              </svg>
            </div>
          </div>

          {/* Dropdown for Joined */}
          <div className="relative font-['Abhaya Libre SemiBold'] flex items-center">
            <div className="relative">
              <select
                className="p-2 border border-[#70707087] rounded-md appearance-none text-left w-48 pr-8"
                value={selectedJoinedTime}
                onChange={(e) => setSelectedJoinedTime(e.target.value)}
              >
                <option value="Anytime">Joined Anytime</option>
            </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.243 4.243z"/>
                </svg>
              </div>
            </div>
            <div className="relative inline-block ml-[6px]">
            <select 
              className="appearance-none bg-transparent border-none p-2 mr-7 cursor-pointer"
              onChange={() => console.log('More Square clicked')}
            >
              <option value="" className="hidden"></option>
            </select>
            <div className="absolute inset-0 pointer-events-none">
              <svg width="46" height="42" viewBox="0 0 46 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_991_4207)">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M27.2067 10.043H30.4733C31.8248 10.043 32.9212 11.1489 32.9212 12.5132V15.8071C32.9212 17.1703 31.8248 18.2773 30.4733 18.2773H27.2067C25.8542 18.2773 24.7578 17.1703 24.7578 15.8071V12.5132C24.7578 11.1489 25.8542 10.043 27.2067 10.043Z" stroke="#050505" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.3708 10.043H18.6364C19.9889 10.043 21.0853 11.1489 21.0853 12.5132V15.8071C21.0853 17.1703 19.9889 18.2773 18.6364 18.2773H15.3708C14.0183 18.2773 12.9219 17.1703 12.9219 15.8071V12.5132C12.9219 11.1489 14.0183 10.043 15.3708 10.043Z" stroke="#050505" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.3708 21.8086H18.6364C19.9889 21.8086 21.0853 22.9145 21.0853 24.2798V27.5727C21.0853 28.937 19.9889 30.0429 18.6364 30.0429H15.3708C14.0183 30.0429 12.9219 28.937 12.9219 27.5727V24.2798C12.9219 22.9145 14.0183 21.8086 15.3708 21.8086Z" stroke="#050505" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M27.2067 21.8086H30.4733C31.8248 21.8086 32.9212 22.9145 32.9212 24.2798V27.5727C32.9212 28.937 31.8248 30.0429 30.4733 30.0429H27.2067C25.8542 30.0429 24.7578 28.937 24.7578 27.5727V24.2798C24.7578 22.9145 25.8542 21.8086 27.2067 21.8086Z" stroke="#050505" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M32.833 1.03125H12.6101C5.56281 1.03125 1.14453 5.57545 1.14453 12.0062V29.3587C1.14453 35.7894 5.53948 40.3336 12.6101 40.3336H32.8306C39.9013 40.3336 44.3009 35.7894 44.3009 29.3587V12.0062C44.3009 5.57545 39.9013 1.03125 32.833 1.03125Z" stroke="#6B6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <filter id="filter0_d_991_4207" x="8.17188" y="9.29297" width="29.5" height="29.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="2"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_991_4207"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_991_4207" result="shape"/>
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

        <div className="flex items-center space-x-3 font-['Abhaya Libre SemiBold']">
          <div className="relative inline-block">
            <select 
              className="appearance-none bg-transparent border-none p-1.5 mr-7 cursor-pointer"
              onChange={() => console.log('More Square clicked')}
            >
              <option value="" className="hidden"></option>
            </select>
            <div className="absolute inset-0 pointer-events-none">
              <svg width="45" height="40" viewBox="0 0 45 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M39.2458 27.0841L39.3819 12.8883C39.4293 7.94133 35.6128 4.80928 30.1699 4.76602L15.4829 4.64929C10.0401 4.60604 6.16433 7.66058 6.11676 12.6239L5.98075 26.8181C5.93319 31.7815 9.74976 34.9004 15.1926 34.9437L29.8796 35.0604C35.3225 35.1037 39.1983 32.0458 39.2458 27.0841Z" stroke="#6B6B6B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.6005 12.5018C20.6109 11.4193 21.5849 10.5477 22.7716 10.5571C23.9584 10.5665 24.9174 11.4536 24.907 12.536C24.8966 13.6184 23.9208 14.4901 22.734 14.4806C21.5473 14.4712 20.5901 13.5842 20.6005 12.5018Z" fill="black"/>
                <path d="M20.5302 19.8377C20.5406 18.7553 21.5146 17.8836 22.7013 17.893C23.8881 17.9025 24.847 18.7895 24.8367 19.8719C24.8263 20.9543 23.8505 21.826 22.6637 21.8166C21.477 21.8071 20.5198 20.9201 20.5302 19.8377Z" fill="black"/>
                <path d="M20.4599 27.1736C20.4703 26.0912 21.4443 25.2195 22.631 25.229C23.8178 25.2384 24.7767 26.1254 24.7664 27.2079C24.756 28.2903 23.7802 29.1619 22.5934 29.1525C21.4067 29.1431 20.4495 28.256 20.4599 27.1736Z" fill="black"/>
              </svg>
            </div>
          </div>
          <button className="bg-[#FEE2B2] font-['Abhaya Libre SemiBold'] border border-[#70707087] text-[#273655] px-4 py-2.5 rounded-sm flex items-center space-x-2">
            <span>Export</span>
          </button>
          <button className="bg-[#FF8B37] font-['Abhaya Libre SemiBold'] border border-[#FB6B03] text-white px-4 py-2 rounded-sm flex items-center space-x-2">
            <span className="text-xl">+</span>
            <span>New User</span>
          </button>
        </div>
      </div>

      <div className="bg-transparent rounded-md overflow-hidden w-full font-['Abhaya Libre SemiBold']">
        <table className="w-full min-w-[1100px] divide-y divide-gray-200 border-0">
          <thead className="bg-transparent">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                <input type="checkbox" className="w-5 h-5" />
              </th>
              <th className="px-1 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Full Name
              </th>
              <th className="px-1 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Email Address
              </th>
              <th className="px-1 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Номер телефона
              </th>
              <th className="px-1 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Joined
              </th>
              <th className="px-1 py-3 text-left text-xs font-medium text-[#FF8B37] uppercase tracking-wider flex items-center border-0">
                Permissions
                <div className="ml-1 flex flex-col">
                  <svg className="w-3 h-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="relative px-1 py-3 border-0">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap border-0">
                  <input type="checkbox" className="w-5 h-5" />
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center border-0">
                  <img src="https://via.placeholder.com/24" alt="avatar" className="h-6 w-6 rounded-full mr-2" />
                  {user.fullName}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-[#000000] border-0">{user.email}</td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-[#000000] border-0">{user.phone}</td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-[#000000] border-0">{user.joined}</td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 border-0">
                  <span className={`inline-flex text-xs leading-5 font-semibold ${
                    user.permissions === 'Admin' ? 'bg-[#273655] text-[#FFFFFF] px-4 py-0.5 rounded-sm' :
                    user.permissions === 'Manager' ? 'bg-[#025E8652] text-[#000000] px-4 py-0.5 rounded-sm' :
                    'bg-[#F86812] text-[#FFFFFF] px-4 py-0.5 rounded-sm'
                  }`}>
                    {user.permissions}
                  </span>
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-right text-sm font-medium border-0">
                  <div className="relative inline-block" style={{ width: '85px', height: '20px' }}>
                    <select 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value === 'profile') {
                          console.log('Selected user data:', user);
                          const userData = {
                            fullName: user.fullName,
                            email: user.email,
                            phone: user.phone,
                            joined: user.joined,
                            permissions: user.permissions
                          };
                          console.log('Navigating with user data:', userData);
                          navigate(`/personal-account/admin/users/${user.id}/profile`, {
                            state: { userData }
                          });
                        } else if (e.target.value === 'delete') {
                          console.log('Delete clicked');
                        }
                      }}
                      style={{ 
                        width: '150px', 
                        left: '-5px',
                        boxShadow: '40px 40px 0px rgba(0, 0, 0, 0.9)',
                        borderRadius: '4px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="" className="hidden"></option>
                      <option value="profile" className="text-[#000000] hover:bg-gray-100 px-4 py-2">Профиль пользователя</option>
                      <option value="delete" className="text-[#AD2E2E] hover:bg-gray-100 px-4 py-2">Удалить</option>
                    </select>
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-4">
          <button 
            className="w-12 h-12 flex items-center justify-center border rounded-full text-[18px] bg-[#273655] text-[#FFFFFF]"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            {"<"}
          </button>
          <button 
            className={`w-8 h-8 mt-2 flex items-center justify-center text-[14px] ${currentPage === 1 ? 'border rounded-full bg-[#D8D8D8] text-[#000000]' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button 
            className={`w-8 h-8 mt-2 flex items-center justify-center text-[14px] ${currentPage === 2 ? 'border rounded-full bg-[#D8D8D8] text-[#000000]' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button 
            className={`w-8 h-8 mt-2 flex items-center justify-center text-[14px] ${currentPage === 3 ? 'border rounded-full bg-[#D8D8D8] text-[#000000]' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <button className="w-8 h-8 mt-2 flex items-center justify-center text-[20px]">...</button>
          <button 
            className={`w-8 h-8 mt-2 flex items-center justify-center text-[14px] ${currentPage === 10 ? 'border rounded-full bg-[#D8D8D8] text-[#000000]' : ''}`}
            onClick={() => setCurrentPage(10)}
          >
            10
          </button>
          <button 
            className="w-12 h-12 flex items-center justify-center border rounded-full text-[18px] bg-[#273655] text-[#FFFFFF]"
            onClick={() => setCurrentPage(prev => Math.min(10, prev + 1))}
          >
            {">"}
          </button>
        </div>
        <div>
          <label htmlFor="rows-per-page" className="mr-2">Show:</label>
          <div className="relative inline-block">
            <select id="rows-per-page" className="p-2 border border-[#9B9B9B] rounded-sm appearance-none pr-8">
              <option>10 rows</option>
              <option>20 rows</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col items-center justify-center px-2 text-gray-700">
              <svg className="w-3 h-3 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 