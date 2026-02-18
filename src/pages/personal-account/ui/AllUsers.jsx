import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../../shared/api/usersApi';
import { useAuth } from '../../../shared/context/AuthContext';
import { showSuccessToast, showErrorToast } from '../../../shared/lib/toast';
import { formatCalendarDate } from '../../../shared/lib/utils/date';

// Компонент модального окна подтверждения удаления
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, userName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Иконка предупреждения */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          {/* Заголовок */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-2">
            Подтвердите удаление
          </h3>
          
          {/* Описание */}
          <p className="text-sm text-gray-600 text-center mb-6">
            Вы уверены, что хотите удалить пользователя{' '}
            <span className="font-semibold text-gray-900">"{userName}"</span>?{' '}
            <br />
            <span className="text-red-600 font-medium">Это действие нельзя отменить.</span>
          </p>
          
          {/* Кнопки */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(null);
  
  // Состояния для модального окна удаления
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
    isDeleting: false
  });
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Проверяем роль текущего пользователя
  const isAdmin = currentUser?.role === 'ADMIN';

  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
      setFilteredUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      showErrorToast('Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Обновление роли пользователя (только для ADMIN)
  const handleRoleUpdate = async (userId, newRole) => {
    if (!isAdmin) {
      showErrorToast('Только администратор может изменять роли пользователей');
      return;
    }

    try {
      setIsUpdatingRole(userId);
      await usersApi.updateUserRole(userId, newRole);
      
      // Обновляем локальное состояние
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      showSuccessToast('Роль пользователя успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      showErrorToast('Не удалось обновить роль пользователя');
    } finally {
      setIsUpdatingRole(null);
    }
  };

  // Открытие модального окна удаления
  const openDeleteModal = (user) => {
    setDeleteModal({
      isOpen: true,
      user: user,
      isDeleting: false
    });
  };

  // Закрытие модального окна удаления
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        user: null,
        isDeleting: false
      });
    }
  };

  // Подтверждение удаления пользователя
  const confirmDeleteUser = async () => {
    if (!isAdmin || !deleteModal.user) {
      showErrorToast('Только администратор может удалять пользователей');
      return;
    }

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      await usersApi.deleteUser(deleteModal.user.id);
      
      // Удаляем пользователя из локального состояния
      const updatedUsers = users.filter(user => user.id !== deleteModal.user.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      showSuccessToast('Клиент успешно удален');
      closeDeleteModal();
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      showErrorToast('Не удалось удалить пользователя');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Переход к профилю пользователя
  const handleProfileClick = (userId) => {
    const isAdminUser = currentUser?.role === 'ADMIN';
    const basePath = isAdminUser ? '/admin/users' : '/personal-account/manager/users';
    const profilePath = isAdminUser ? `${basePath}/${userId}/profile` : `${basePath}/${userId}`;
    navigate(profilePath);
  };

  // Получение отображаемого имени роли
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'Администратор',
      'MANAGER': 'Менеджер', 
      'USER': 'Клиент',
      'COURIER': 'Курьер'
    };
    return roleMap[role] || role;
  };

  // Получение CSS класса для роли
  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'COURIER':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return formatCalendarDate(dateString, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Фильтрация пользователей
  useEffect(() => {
    let filtered = users;

    // Фильтр по поисковому запросу
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Фильтр по роли
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Сброс на первую страницу при фильтрации
  }, [searchTerm, selectedRole, users]);

  // Вычисления для пагинации
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Обработчики пагинации
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Сброс на первую страницу
  };

  // Получение массива страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20 px-4">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-gray-200 border-t-[#00A991]"></div>
          <p className="text-sm sm:text-lg font-medium text-gray-600 text-center">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-w-0">
      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
        userName={deleteModal.user?.name || deleteModal.user?.email}
        isDeleting={deleteModal.isDeleting}
      />

      {/* Заголовок с статистикой */}
      <div className="bg-gradient-to-r from-[#00A991] to-[#31876D] rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold mb-1 truncate">
              Управление пользователями
            </h2>
            <p className="text-xs sm:text-sm text-white/80">
              Просматривайте и управляйте всеми пользователями системы
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-3">
              <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
              <div className="text-xs sm:text-sm text-white/80">Всего пользователей</div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Поиск по имени, email или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="w-full sm:w-44 md:w-48 flex-shrink-0">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent transition-colors"
            >
              <option value="">Все роли</option>
              <option value="ADMIN">Администратор</option>
              <option value="MANAGER">Менеджер</option>
              <option value="USER">Клиент</option>
              <option value="COURIER">Курьер</option>
            </select>
          </div>
        </div>

        {/* Настройки пагинации */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Показать:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className="text-xs sm:text-sm text-gray-700">записей</span>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg self-start">
            <span className="font-medium">{startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</span> из <span className="font-medium">{filteredUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Список пользователей: карточки на мобильных, таблица на десктопе */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Мобильный вид — карточки */}
        <div className="md:hidden divide-y divide-gray-100">
          {currentUsers.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-[#00A991] to-[#31876D] flex items-center justify-center text-white font-semibold text-sm">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Имя не указано'}</div>
                    <div className="text-xs text-gray-500">ID: #{user?.public_id}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isAdmin ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      disabled={isUpdatingRole === user.id}
                      className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-all ${getRoleClass(user.role)} ${
                        isUpdatingRole === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                      }`}
                    >
                      <option value="ADMIN">Админ</option>
                      <option value="MANAGER">Менеджер</option>
                      <option value="USER">Клиент</option>
                      <option value="COURIER">Курьер</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1.5 text-xs font-semibold rounded-lg ${getRoleClass(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                <div className="truncate">{user.email}</div>
                <div>{user.phone || 'Телефон не указан'}</div>
                <div className="text-gray-500">{formatDate(user.registration_date)}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleProfileClick(user.id)}
                  className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Профиль
                </button>
                {isAdmin && (
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Десктоп — таблица */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Дата регистрации
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 lg:h-11 lg:w-11">
                        <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-full bg-gradient-to-br from-[#00A991] to-[#31876D] flex items-center justify-center text-white font-semibold text-sm">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.name || 'Имя не указано'}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500">
                          ID: #{user?.public_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{user.email}</div>
                    <div className="text-xs lg:text-sm text-gray-500">{user.phone || 'Не указан'}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    {isAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        disabled={isUpdatingRole === user.id}
                        className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${getRoleClass(user.role)} ${
                          isUpdatingRole === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                        }`}
                      >
                        <option value="ADMIN">Администратор</option>
                        <option value="MANAGER">Менеджер</option>
                        <option value="USER">Клиент</option>
                        <option value="COURIER">Курьер</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-3 py-2 text-xs font-semibold rounded-lg ${getRoleClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-600 font-medium">
                    {formatDate(user.registration_date)}
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right text-sm space-x-2 lg:space-x-3">
                    <button
                      onClick={() => handleProfileClick(user.id)}
                      className="inline-flex items-center px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1 lg:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Профиль
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="inline-flex items-center px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1 lg:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="bg-gray-50/50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 overflow-x-auto">
            <div className="flex items-center justify-center min-w-0">
              <nav className="flex items-center flex-wrap justify-center gap-1 sm:gap-0 sm:space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Назад</span>
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`inline-flex items-center justify-center min-w-[2rem] sm:min-w-0 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-gray-300 transition-colors ${
                      page === currentPage
                        ? 'bg-[#00A991] text-white border-[#00A991]'
                        : page === '...'
                        ? 'bg-white text-gray-400 cursor-default'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Вперед</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Сообщение если нет пользователей */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12 px-4 bg-white rounded-xl border border-gray-200">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedRole ? 'Пользователи не найдены' : 'Нет пользователей'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm || selectedRole 
              ? 'Попробуйте изменить фильтры поиска' 
              : 'В системе пока нет зарегистрированных пользователей'
            }
          </p>
          {(searchTerm || selectedRole) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('');
              }}
              className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AllUsers;