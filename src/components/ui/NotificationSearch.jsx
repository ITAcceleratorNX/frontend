import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../../shared/lib/utils';

export const NotificationSearch = ({ onSearch, onClear, isLoading = false }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    notification_type: '',
    date_from: '',
    date_to: '',
    is_read: '',
    user_role: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Обновляем родительский компонент при изменении параметров
  useEffect(() => {
    const hasActiveFilters = Object.values(searchParams).some(value => value !== '');
    if (hasActiveFilters) {
      onSearch(searchParams);
    } else {
      onClear();
    }
  }, [searchParams, onSearch, onClear]);

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setSearchParams({
      query: '',
      notification_type: '',
      date_from: '',
      date_to: '',
      is_read: '',
      user_role: ''
    });
  };

  const handleDateSelect = (field, date) => {
    if (date) {
      setSearchParams(prev => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd')
      }));
    } else {
      setSearchParams(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const hasActiveFilters = Object.values(searchParams).some(value => value !== '');

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Основная строка поиска */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по заголовку и сообщению..."
            value={searchParams.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="whitespace-nowrap"
        >
          {showAdvanced ? 'Скрыть фильтры' : 'Расширенные фильтры'}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Очистить
          </Button>
        )}
      </div>

      {/* Расширенные фильтры */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Тип уведомления */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Тип уведомления</label>
            <Select
              value={searchParams.notification_type}
              onValueChange={(value) => handleInputChange('notification_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все типы</SelectItem>
                <SelectItem value="general">Общие</SelectItem>
                <SelectItem value="payment">Платежи</SelectItem>
                <SelectItem value="contract">Договоры</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Статус прочтения */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Статус</label>
            <Select
              value={searchParams.is_read}
              onValueChange={(value) => handleInputChange('is_read', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value="false">Непрочитанные</SelectItem>
                <SelectItem value="true">Прочитанные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Роль пользователя */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Роль пользователя</label>
            <Select
              value={searchParams.user_role}
              onValueChange={(value) => handleInputChange('user_role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все роли" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все роли</SelectItem>
                <SelectItem value="USER">Пользователь</SelectItem>
                <SelectItem value="MANAGER">Менеджер</SelectItem>
                <SelectItem value="ADMIN">Администратор</SelectItem>
                <SelectItem value="COURIER">Курьер</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Дата от */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Дата от</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchParams.date_from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchParams.date_from ? formatDate(searchParams.date_from) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={searchParams.date_from ? new Date(searchParams.date_from) : undefined}
                  onSelect={(date) => handleDateSelect('date_from', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Дата до */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Дата до</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchParams.date_to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchParams.date_to ? formatDate(searchParams.date_to) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={searchParams.date_to ? new Date(searchParams.date_to) : undefined}
                  onSelect={(date) => handleDateSelect('date_to', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Поиск...</span>
        </div>
      )}
    </div>
  );
};
