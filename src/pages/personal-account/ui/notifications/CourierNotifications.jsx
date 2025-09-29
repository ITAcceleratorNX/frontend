import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Settings, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { useNotifications } from '../../../../shared/lib/hooks/use-notifications';
import UserNotifications from './UserNotifications';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const CourierNotifications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [appliedFilters, setAppliedFilters] = useState({
    query: '',
    type: 'all',
    read: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);

  // Используем хук для получения данных уведомлений
  const {
    notifications,
    isLoading,
    error,
    markAsRead
  } = useNotifications();

  // Отладочный вывод для проверки структуры данных (только в development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('CourierNotifications - полученные данные:', notifications);
    }
  }, [notifications]);

  // Функция применения фильтров
  const applyFilters = () => {
    setIsSearching(true);
    setTimeout(() => {
      setAppliedFilters({
        query: searchQuery,
        type: filterType,
        read: filterRead
      });
      setIsSearching(false);
    }, 300); // Небольшая задержка для плавности
  };

  // Фильтрация уведомлений на основе примененных фильтров
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    return notifications.filter(notification => {
      // Поиск по тексту
      if (appliedFilters.query) {
        const searchLower = appliedFilters.query.toLowerCase();
        const matchesSearch = 
          notification.title?.toLowerCase().includes(searchLower) ||
          notification.message?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Фильтр по типу
      if (appliedFilters.type !== 'all' && notification.notification_type !== appliedFilters.type) {
        return false;
      }
      
      // Фильтр по статусу прочтения
      if (appliedFilters.read !== 'all') {
        const isRead = appliedFilters.read === 'true';
        if (notification.is_read !== isRead) return false;
      }
      
      return true;
    });
  }, [notifications, appliedFilters]);

  const unreadCount = filteredNotifications?.filter(n => !n.is_read)?.length || 0;
  const totalCount = filteredNotifications?.length || 0;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterRead('all');
    setAppliedFilters({
      query: '',
      type: 'all',
      read: 'all'
    });
  };

  const hasActiveFilters = appliedFilters.query || appliedFilters.type !== 'all' || appliedFilters.read !== 'all';
  const hasUnappliedChanges = searchQuery !== appliedFilters.query || filterType !== appliedFilters.type || filterRead !== appliedFilters.read;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-[#1e2c4f] animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Загрузка уведомлений
            </h3>
            <p className="text-sm text-muted-foreground">
              Пожалуйста, подождите...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Ошибка загрузки</h3>
            <p className="text-gray-600">Не удалось загрузить уведомления</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-[#1e2c4f] text-white rounded-lg hover:bg-[#1e2c4f]/90 transition-colors font-medium"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e2c4f] to-[#2d3f5f] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Мои уведомления</h1>
              <p className="text-white/80">
                {notifications?.length > 0 
                  ? `${hasActiveFilters ? 'Найдено' : 'Всего уведомлений'}: ${totalCount}${unreadCount > 0 ? ` • Непрочитанных: ${unreadCount}` : ''}`
                  : 'У вас пока нет уведомлений'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        {notifications?.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white/80">Непрочитанные: {unreadCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/80">Прочитанные: {totalCount - unreadCount}</span>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="text-sm text-white/80">
                Показано {totalCount} из {notifications.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Поиск и фильтры */}
      {notifications && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по заголовку и сообщению..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="general">Общие</SelectItem>
                <SelectItem value="payment">Платежи</SelectItem>
                <SelectItem value="contract">Договоры</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="false">Непрочитанные</SelectItem>
                <SelectItem value="true">Прочитанные</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={applyFilters}
              disabled={!hasUnappliedChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="h-4 w-4 mr-1" />
              Поиск
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Очистить
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 min-h-[500px]">
        {notifications?.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Пока нет уведомлений</h3>
                <p className="text-gray-500 max-w-sm">
                  Когда у вас появятся новые уведомления, они будут отображаться здесь
                </p>
              </div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Ничего не найдено</h3>
                <p className="text-gray-500 max-w-sm">
                  Попробуйте изменить параметры поиска или очистить фильтры
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="mt-2">
                    Очистить фильтры
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Поиск...</span>
                </div>
              </div>
            ) : (
              <UserNotifications 
                notifications={filteredNotifications || []}
                onMarkAsRead={markAsRead}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierNotifications; 