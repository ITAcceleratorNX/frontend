import React, { useState, useRef, useCallback } from 'react';
import { Settings, Plus, History, Loader2, AlertCircle, Shield, BarChart3 } from 'lucide-react';
import { useNotifications, useSearchNotifications } from '../../../../shared/lib/hooks/use-notifications';
import NotificationCard from './NotificationCard';
import CreateNotificationForm from './CreateNotificationForm';
import { NotificationSearch } from '../../../../components/ui/NotificationSearch';

const ManagerNotifications = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchParams, setSearchParams] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const observerRef = useRef(null);

  const {
    notifications,
    total,
    users,
    stats,
    isLoading,
    error,
    sendNotification,
    isSending,
    markAsRead,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();

  // Поиск уведомлений
  const searchResult = useSearchNotifications(searchParams || {});

  // IntersectionObserver
  const lastElementRef = useCallback(
      (node) => {
        if (isFetchingNextPage) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        });

        if (node) observerRef.current.observe(node);
      },
      [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleSendNotification = async (notification) => {
    try {
      await sendNotification(notification);
      setActiveTab('history');
    } catch (error) {
      console.error('Send notification error:', error);
    }
  };

  const handleSearch = (params) => {
    // Фильтруем параметры, убирая значения 'all' и пустые строки
    const filteredParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filteredParams[key] = value;
      }
    });
    
    setSearchParams(filteredParams);
    setIsSearchMode(true);
  };

  const handleClearSearch = () => {
    setSearchParams(null);
    setIsSearchMode(false);
  };

  // Определяем какие данные показывать
  const displayData = isSearchMode ? {
    notifications: searchResult.data?.notifications || [],
    total: searchResult.data?.total || 0,
    isLoading: searchResult.isLoading,
    error: searchResult.error
  } : {
    notifications,
    total,
    isLoading,
    error
  };

  // Показываем полный экран загрузки только при первоначальной загрузке данных, не при поиске
  if (isLoading && !isSearchMode) {
    return (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-12 h-12 text-[#1e2c4f] animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Загрузка системы уведомлений
              </h3>
              <p className="text-sm text-muted-foreground">Пожалуйста, подождите...</p>
            </div>
          </div>
        </div>
    );
  }

  if (displayData.error) {
    return (
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Ошибка загрузки</h3>
              <p className="text-gray-600">
                {isSearchMode ? 'Не удалось выполнить поиск' : 'Не удалось загрузить систему уведомлений'}
              </p>
              <p className="text-sm text-gray-500">{displayData.error.message}</p>
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

  const totalNotifications = displayData.total || 0;
  const totalUsers = users?.length || 0;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e2c4f] to-[#2d3f5f] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Система уведомлений</h1>
                <p className="text-white/80">
                  Управление уведомлениями и коммуникацией с пользователями
                </p>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-white/80" />
                <div>
                  <p className="text-white/80 text-sm">Всего уведомлений</p>
                  <p className="text-xl font-bold text-white">{totalNotifications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-white/80" />
                <div>
                  <p className="text-white/80 text-sm">Пользователей</p>
                  <p className="text-xl font-bold text-white">{totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-white/80" />
                <div>
                  <p className="text-white/80 text-sm">Отправлено сегодня</p>
                  <p className="text-xl font-bold text-white">{stats?.sentToday || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Поиск уведомлений */}
        <NotificationSearch 
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isLoading={searchResult.isLoading}
        />

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                      activeTab === 'create'
                          ? 'border-b-2 border-[#1e2c4f] text-[#1e2c4f] bg-blue-50'
                          : 'text-gray-600 hover:text-[#1e2c4f] hover:bg-gray-50'
                  }`}
              >
                <Plus className="w-4 h-4" />
                <span>Создать уведомление</span>
              </button>

              <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                      activeTab === 'history'
                          ? 'border-b-2 border-[#1e2c4f] text-[#1e2c4f] bg-blue-50'
                          : 'text-gray-600 hover:text-[#1e2c4f] hover:bg-gray-50'
                  }`}
              >
                <History className="w-4 h-4" />
                <span>История уведомлений</span>
                {totalNotifications > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {totalNotifications}
                </span>
                )}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="min-h-[500px]">
            {activeTab === 'create' && (
                <div className="p-6">
                  <CreateNotificationForm users={users || []} onSendNotification={handleSendNotification} />
                </div>
            )}

            {activeTab === 'history' && (
                <div className="p-6 space-y-4">
                  {/* Индикатор режима поиска */}
                  {isSearchMode && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-700">
                            Показаны результаты поиска: {displayData.notifications.length} из {displayData.total}
                          </span>
                        </div>
                        <button
                          onClick={handleClearSearch}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Показать все уведомления
                        </button>
                      </div>
                    </div>
                  )}

                  {displayData.isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1e2c4f]" />
                        <span className="text-sm">Поиск уведомлений...</span>
                      </div>
                    </div>
                  ) : displayData.notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {isSearchMode ? 'Ничего не найдено' : 'Уведомлений пока нет'}
                      </h3>
                      <p className="text-gray-600">
                        {isSearchMode 
                          ? 'Попробуйте изменить параметры поиска' 
                          : 'Уведомления появятся здесь после их создания'
                        }
                      </p>
                    </div>
                  ) : (
                    displayData.notifications.map((n, index) => {
                      if (!isSearchMode && displayData.notifications.length === index + 1) {
                        return (
                            <div ref={lastElementRef} key={n.notification_id}>
                              <NotificationCard notification={n} onMarkAsRead={markAsRead} />
                            </div>
                        );
                      } else {
                        return <NotificationCard key={n.notification_id} notification={n} onMarkAsRead={markAsRead} />;
                      }
                    })
                  )}

                  {!isSearchMode && isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-8 h-8 text-[#1e2c4f] animate-spin" />
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>

        {/* Loading overlay */}
        {isSending && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center">
                <Loader2 className="w-8 h-8 text-[#1e2c4f] animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Отправка уведомления</h3>
                <p className="text-gray-600">Пожалуйста, подождите...</p>
              </div>
            </div>
        )}
      </div>
  );
};

export default ManagerNotifications;