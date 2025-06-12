import React, { useState } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState('All');
  const [selectedJoinedTime, setSelectedJoinedTime] = useState('Anytime');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = DUMMY_USERS.filter(user => {
    const matchesSearchTerm = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPermissions = selectedPermissions === 'All' || user.permissions === selectedPermissions;
    // Добавить логику для фильтрации по joinedTime, если потребуется более сложная фильтрация

    return matchesSearchTerm && matchesPermissions;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Пользователи платформы</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
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
          <div className="relative font-['Abhaya Libre SemiBold']">
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
        </div>

        <div className="flex items-center space-x-4 font-['Abhaya Libre SemiBold']">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Email Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Номер телефона
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#000000] uppercase tracking-wider border-0">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#FF8B37] uppercase tracking-wider flex items-center border-0">
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
              <th className="relative px-6 py-3 border-0">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center border-0">
                  <img src="https://via.placeholder.com/24" alt="avatar" className="h-6 w-6 rounded-full mr-2" />
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#000000] border-0">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#000000] border-0">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#000000] border-0">{user.joined}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-0">
                  <span className={`inline-flex text-xs leading-5 font-semibold ${
                    user.permissions === 'Admin' ? 'bg-[#273655] text-[#FFFFFF] px-4 py-0.5 rounded-sm' :
                    user.permissions === 'Manager' ? 'bg-[#025E8652] text-[#000000] px-4 py-0.5 rounded-sm' :
                    'bg-[#F86812] text-[#FFFFFF] px-4 py-0.5 rounded-sm'
                  }`}>
                    {user.permissions}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-0">
                  <button className="text-gray-500 hover:text-gray-900">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    </svg>
                  </button>
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