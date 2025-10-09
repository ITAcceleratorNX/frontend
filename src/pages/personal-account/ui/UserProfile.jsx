import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { usersApi } from '../../../shared/api/usersApi';
import { useAuth } from '../../../shared/context/AuthContext';
import { toast } from 'react-toastify';

// Компонент модального окна подтверждения удаления
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, userName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Иконка предупреждения */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          {/* Заголовок */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
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
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Функция для обработки навигации в сайдбаре
  const handleNavClick = (navKey) => {
    navigate('/personal-account', { state: { activeSection: navKey } });
  };
  
  // Состояния для модального окна удаления
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  });

  // Проверяем роль текущего пользователя
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'MANAGER';
  const isAdminOrManager = isAdmin || isManager;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersApi.getAllUsers();
        setUsers(Array.isArray(data) ? data : []);
        
        // Находим пользователя по ID
        const user = Array.isArray(data) ? data.find(u => u.id === parseInt(userId)) : null;
        setSelectedUser(user);
        
        if (!user) {
          toast.error('Пользователь не найден');
          handleBackToUsers();
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        toast.error('Не удалось загрузить данные пользователя');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  // Обновление роли пользователя (только для ADMIN)
  const handleRoleUpdate = async (newRole) => {
    if (!isAdmin || !selectedUser) {
      toast.error('Только администратор может изменять роли пользователей');
      return;
    }

    try {
      setIsUpdatingRole(true);
      await usersApi.updateUserRole(selectedUser.id, newRole);
      
      // Обновляем локальное состояние
      setSelectedUser(prev => ({ ...prev, role: newRole }));
      
      toast.success('Роль пользователя успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      toast.error('Не удалось обновить роль пользователя');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Возврат к списку пользователей
  const handleBackToUsers = () => {
    const isAdminUser = currentUser?.role === 'ADMIN';
    navigate('/personal-account', { state: { activeSection: isAdminUser ? 'adminusers' : 'managerusers' } });
  };

  // Получение отображаемого имени роли
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'Администратор',
      'MANAGER': 'Менеджер', 
      'USER': 'Пользователь',
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
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Открытие модального окна удаления
  const openDeleteModal = () => {
    setDeleteModal({
      isOpen: true,
      isDeleting: false
    });
  };

  // Закрытие модального окна удаления
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        isDeleting: false
      });
    }
  };

  // Подтверждение удаления пользователя
  const confirmDeleteUser = async () => {
    if (!isAdmin || !selectedUser) {
      toast.error('Только администратор может удалять пользователей');
      return;
    }

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      await usersApi.deleteUser(selectedUser.id);
      
      toast.success('Пользователь успешно удален');
      closeDeleteModal();
      
      // Перенаправляем обратно к списку пользователей
      setTimeout(() => {
        handleBackToUsers();
      }, 1000);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      toast.error('Не удалось удалить пользователя');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />
          <main className="flex-1 mr-[110px]">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[#273655]"></div>
                <p className="text-lg font-medium text-gray-600">Загрузка профиля...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />
          <main className="flex-1 mr-[110px]">
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователь не найден</h3>
              <p className="text-gray-500 mb-4">Запрашиваемый пользователь не существует или был удален</p>
              <button
                onClick={handleBackToUsers}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#273655] bg-[#273655]/5 hover:bg-[#273655]/10 rounded-lg transition-colors"
              >
                Вернуться к списку
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
        userName={selectedUser.name || selectedUser.email}
        isDeleting={deleteModal.isDeleting}
      />
      
      <div className="flex flex-1">
        <Sidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />
        <main className="flex-1 mr-[110px]">
          <div className="max-w-4xl mx-auto py-8 px-6">
            {/* Навигация назад */}
            <div className="flex items-center mb-8">
              <button
                onClick={handleBackToUsers}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Назад к списку
              </button>
            </div>

            {/* Карточка профиля пользователя */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Заголовок карточки */}
              <div className="bg-gradient-to-r from-[#273655] to-[#1e2c4f] px-6 py-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-20 w-20">
                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                      {(selectedUser.name || selectedUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <h1 className="text-2xl font-bold text-white">
                      {selectedUser.name || 'Имя не указано'}
                    </h1>
                    <p className="text-white/80 text-lg">{selectedUser.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-lg ${getRoleClass(selectedUser.role).replace('text-', 'text-white ').replace('bg-', 'bg-white/20 ').replace('border-', 'border-white/30 ')}`}>
                        {getRoleDisplayName(selectedUser.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Основная информация */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Левая колонка */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Личная информация
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">ID пользователя:</span>
                          <span className="text-gray-900">#{selectedUser.public_id}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Имя:</span>
                          <span className="text-gray-900">{selectedUser.name || 'Не указано'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="text-gray-900">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Телефон:</span>
                          <span className="text-gray-900">{selectedUser.phone || 'Не указан'}</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span className="font-medium text-gray-600">Дата регистрации:</span>
                          <span className="text-gray-900">{formatDate(selectedUser.registration_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Правая колонка */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Управление ролью
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Текущая роль:
                          </label>
                          {isAdmin ? (
                            <select
                              value={selectedUser.role}
                              onChange={(e) => handleRoleUpdate(e.target.value)}
                              disabled={isUpdatingRole}
                              className={`w-full px-3 py-2 text-sm font-semibold rounded-lg transition-all ${getRoleClass(selectedUser.role)} ${
                                isUpdatingRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                              }`}
                            >
                              <option value="ADMIN">Администратор</option>
                              <option value="MANAGER">Менеджер</option>
                              <option value="USER">Пользователь</option>
                              <option value="COURIER">Курьер</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getRoleClass(selectedUser.role)}`}>
                              {getRoleDisplayName(selectedUser.role)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Дополнительные действия для администратора */}
                    {isAdmin && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Действия администратора
                        </h3>
                        <div className="space-y-3">
                          {/* <button
                            className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-[#273655] bg-[#273655]/5 hover:bg-[#273655]/10 rounded-lg transition-colors"
                            onClick={() => {
                              // TODO: Добавить функционал просмотра заказов пользователя
                              console.log('Просмотр заказов пользователя:', selectedUser.id);
                              toast.info('Функция в разработке');
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Просмотреть заказы
                          </button>
                          
                          <button
                            className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-[#273655] bg-[#273655]/5 hover:bg-[#273655]/10 rounded-lg transition-colors"
                            onClick={() => {
                              // TODO: Добавить функционал просмотра платежей пользователя
                              console.log('Просмотр платежей пользователя:', selectedUser.id);
                              toast.info('Функция в разработке');
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Просмотреть платежи
                          </button> */}

                          <div className="border-t border-gray-200 pt-3 mt-6">
                            <button
                              onClick={openDeleteModal}
                              className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Удалить пользователя
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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

export default UserProfile; 