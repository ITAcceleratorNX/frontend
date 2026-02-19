import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { useNotifications } from '../../../../shared/lib/hooks/use-notifications';
import UserNotifications from './UserNotifications';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Card, CardContent } from '../../../../components/ui/card';

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

  const {
    notifications,
    isLoading,
    error,
    markAsRead
  } = useNotifications();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('CourierNotifications - полученные данные:', notifications);
    }
  }, [notifications]);

  const applyFilters = () => {
    setIsSearching(true);
    setTimeout(() => {
      setAppliedFilters({
        query: searchQuery,
        type: filterType,
        read: filterRead
      });
      setIsSearching(false);
    }, 300);
  };

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    return notifications.filter(notification => {
      if (appliedFilters.query) {
        const searchLower = appliedFilters.query.toLowerCase();
        const matchesSearch =
          notification.title?.toLowerCase().includes(searchLower) ||
          notification.message?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (appliedFilters.type !== 'all' && notification.notification_type !== appliedFilters.type) {
        return false;
      }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px] px-3">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A991] animate-spin" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Загрузка уведомлений</h3>
            <p className="text-sm text-gray-500 mt-1">Пожалуйста, подождите...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] sm:min-h-[500px] flex items-center justify-center px-3">
        <Card className="max-w-md w-full rounded-xl border-red-200 bg-white">
          <CardContent className="text-center py-8 sm:py-10 px-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-1">Не удалось загрузить уведомления</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">{error.message}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-5 py-2.5"
            >
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto min-w-0 px-0 sm:px-2">
      {/* Header — в стиле раздела Запросы */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Мои уведомления</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {notifications?.length > 0
            ? `${hasActiveFilters ? 'Найдено' : 'Всего'}: ${totalCount}${unreadCount > 0 ? ` · Непрочитанных: ${unreadCount}` : ''}`
            : 'У вас пока нет уведомлений'}
        </p>
      </div>

      {/* Статистика — компактная полоска */}
      {notifications?.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 py-2 px-3 sm:px-4 rounded-xl bg-white border border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-[#00A991] rounded-full" />
            <span className="text-gray-600">Непрочитанные: <span className="font-medium text-gray-900">{unreadCount}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <span className="text-gray-600">Прочитанные: <span className="font-medium text-gray-900">{totalCount - unreadCount}</span></span>
          </div>
          {hasActiveFilters && (
            <span className="text-xs sm:text-sm text-gray-500 ml-auto">
              Показано {totalCount} из {notifications.length}
            </span>
          )}
        </div>
      )}

      {/* Поиск и фильтры — адаптивно */}
      {notifications && notifications.length > 0 && (
        <Card className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по заголовку и сообщению..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-lg h-10"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[140px] rounded-lg border-gray-200">
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
                  <SelectTrigger className="w-full sm:w-[140px] rounded-lg border-gray-200">
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
                  className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2 h-10 shrink-0"
                >
                  <Search className="h-4 w-4 mr-1 sm:mr-2" />
                  Поиск
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="rounded-full border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-1 sm:mr-2" />
                    Очистить
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список уведомлений */}
      <Card className="rounded-xl border border-gray-200 bg-white min-h-[300px] sm:min-h-[400px]">
        {notifications?.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-16 px-4">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#00A991]/10 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-[#00A991]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Пока нет уведомлений</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Когда появятся новые уведомления, они отобразятся здесь
                </p>
              </div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-16 px-4">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ничего не найдено</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Измените параметры поиска или очистите фильтры
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="mt-2 rounded-full border-[#00A991]/40 text-[#004743] hover:bg-[#00A991]/10">
                    Очистить фильтры
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 md:p-6">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00A991]" />
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
      </Card>
    </div>
  );
};

export default CourierNotifications;
