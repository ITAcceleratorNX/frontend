import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, X, User, Mail, Phone, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const ClientSelector = ({ isOpen, onClose, selectedUser, onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    iin: '',
    address: '',
    bday: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Поиск пользователей
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await usersApi.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
      toast.error('Не удалось выполнить поиск пользователей');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Сброс формы при открытии
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        iin: '',
        address: '',
        bday: '',
      });
      setFormErrors({});
    }
  }, [isOpen]);

  // Валидация формы
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Некорректный email';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Телефон обязателен';
    }
    
    if (!formData.iin.trim()) {
      errors.iin = 'ИИН обязателен';
    } else if (formData.iin.length !== 12) {
      errors.iin = 'ИИН должен содержать 12 цифр';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Адрес обязателен';
    }
    
    if (!formData.bday.trim()) {
      errors.bday = 'Дата рождения обязательна';
    } else {
      // Проверка, что дата не в будущем
      const selectedDate = new Date(formData.bday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errors.bday = 'Дата рождения не может быть в будущем';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Создание пользователя
  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const newUser = await usersApi.createUserByManager({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        iin: formData.iin.trim(),
        address: formData.address.trim(),
        bday: formData.bday.trim(),
      });
      
      toast.success('Пользователь успешно создан. Клиент сможет войти через Google OAuth.');
      onUserSelect(newUser);
      onClose();
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      const errorMessage = error.response?.data?.details?.[0]?.message || 
                          error.response?.data?.error || 
                          'Не удалось создать пользователя';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Выбор пользователя из результатов поиска
  const handleSelectUser = (user) => {
    onUserSelect(user);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-[#273655]">
            {showCreateForm ? 'Создание нового клиента' : 'Выбор клиента'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!showCreateForm ? (
            <div className="space-y-4">
              {/* Поиск */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Поиск по имени, email или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-2xl border-[#273655]/20 text-[#273655] focus:ring-2 focus:ring-[#273655]/30"
                />
              </div>

              {/* Результаты поиска */}
              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-700 mb-1">Пользователи не найдены</p>
                  <p className="text-sm text-gray-500">Попробуйте другой запрос или создайте нового пользователя</p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedUser?.id === user.id
                          ? 'border-[#273655] bg-[#273655]/5 shadow-sm'
                          : 'border-gray-200 hover:border-[#273655]/40 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedUser?.id === user.id ? 'bg-[#273655]' : 'bg-gray-100'
                            }`}>
                              <User className={`h-5 w-5 ${
                                selectedUser?.id === user.id ? 'text-white' : 'text-gray-400'
                              }`} />
                            </div>
                            <span className="font-semibold text-[#273655] text-base">
                              {user.name || 'Без имени'}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-sm text-gray-600 ml-12">
                            {user.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            {user.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedUser?.id === user.id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-[#273655] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Начните вводить имя, email или телефон для поиска</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      iin: '',
                      address: '',
                      bday: '',
                    });
                    setFormErrors({});
                  }}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-[#273655]">Создание нового клиента</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Имя *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.name 
                        ? 'border-red-300 bg-red-50 focus:ring-red-300' 
                        : 'border-[#273655]/20 focus:ring-[#273655]/30'
                    }`}
                    placeholder="Введите имя"
                  />
                  {formErrors.name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.email 
                        ? 'border-red-300 bg-red-50 focus:ring-red-300' 
                        : 'border-[#273655]/20 focus:ring-[#273655]/30'
                    }`}
                    placeholder="example@mail.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Телефон *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.phone 
                        ? 'border-red-300 bg-red-50 focus:ring-red-300' 
                        : 'border-[#273655]/20 focus:ring-[#273655]/30'
                    }`}
                    placeholder="+7 700 123 4567"
                  />
                  {formErrors.phone && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="iin" className="text-sm font-medium text-gray-700 mb-2 block">
                    ИИН (12 цифр) *
                  </Label>
                  <Input
                    id="iin"
                    type="text"
                    maxLength={12}
                    value={formData.iin}
                    onChange={(e) => setFormData({ ...formData, iin: e.target.value.replace(/\D/g, '') })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.iin 
                        ? 'border-red-300 bg-red-50 focus:ring-red-300' 
                        : 'border-[#273655]/20 focus:ring-[#273655]/30'
                    }`}
                    placeholder="123456789012"
                  />
                  {formErrors.iin && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.iin}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                    Адрес *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.address 
                        ? 'border-red-300 bg-red-50 focus:ring-red-300' 
                        : 'border-[#273655]/20 focus:ring-[#273655]/30'
                    }`}
                    placeholder="г. Алматы, ул. Абая, д. 25"
                  />
                  {formErrors.address && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bday" className="text-sm font-medium text-gray-700 mb-2 block">
                    Дата рождения *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] h-5 w-5 pointer-events-none" />
                    <Input
                      id="bday"
                      type="date"
                      value={formData.bday}
                      onChange={(e) => setFormData({ ...formData, bday: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className={`h-12 rounded-2xl border pl-12 transition-colors ${
                        formErrors.bday 
                          ? 'border-red-300 bg-red-50 focus:ring-red-300' 
                          : 'border-[#273655]/20 focus:ring-[#273655]/30'
                      }`}
                    />
                  </div>
                  {formErrors.bday && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.bday}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Вход через Google OAuth
                    </p>
                    <p className="text-xs text-blue-700">
                      Клиент сможет войти в систему через Google аккаунт. Пароль не требуется.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {!showCreateForm ? (
            <Button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="w-full h-12 rounded-2xl bg-[#273655] hover:bg-[#1e2c4f] text-white font-semibold transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Создать нового клиента
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    iin: '',
                    address: '',
                    bday: '',
                  });
                  setFormErrors({});
                }}
                className="flex-1 h-12 rounded-2xl border-gray-300"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleCreateUser}
                disabled={isCreating}
                className="flex-1 h-12 rounded-2xl bg-[#273655] hover:bg-[#1e2c4f] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Создание...</span>
                  </div>
                ) : (
                  'Создать клиента'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelector;
